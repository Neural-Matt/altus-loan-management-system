import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Stack, IconButton, Chip, Tooltip, LinearProgress, Divider, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWizardData, UploadedDoc } from '../WizardDataContext';
import { useSnackbar } from '../../feedback/SnackbarProvider';
import { useAltus } from '../../../context/AltusContext';
import { useUATWorkflow } from '../../../hooks/useUATWorkflow';
import { preValidateFile, attemptOcr } from '../../../utils/docValidation';
import { mergePayslips } from '../../../utils/payslipMerger';
import { mergeNRCImages } from '../../../utils/nrcMerger';

const docTypes: { label: string; type: UploadedDoc['type']; accept: string; optional?: boolean; helper?: string; }[] = [
  { label: 'NRC (Front)', type: 'nrc-front', accept: '.jpg,.jpeg,.png,.pdf', helper: 'Clear photo of NRC front side' },
  { label: 'NRC (Back)', type: 'nrc-back', accept: '.jpg,.jpeg,.png,.pdf', helper: 'Clear photo of NRC back side' },
  { label: 'Payslip (1 of 3)', type: 'payslip-1', accept: '.jpg,.jpeg,.png,.pdf', helper: 'Oldest of the last 3 payslips' },
  { label: 'Payslip (2 of 3)', type: 'payslip-2', accept: '.jpg,.jpeg,.png,.pdf', helper: 'Middle month payslip' },
  { label: 'Payslip (3 of 3)', type: 'payslip-3', accept: '.jpg,.jpeg,.png,.pdf', helper: 'Most recent payslip' },
  { label: 'Application Form/ Pre-Approval Form', type: 'reference-letter', accept: '.jpg,.jpeg,.png,.pdf', optional: true, helper: 'Pre-approval form from employer or institution' },
  { label: 'Work ID', type: 'work-id', accept: '.jpg,.jpeg,.png,.pdf', optional: true },
  { label: 'Selfie / Applicant Photo', type: 'selfie', accept: '.jpg,.jpeg,.png', optional: true, helper: 'Clear, well-lit photo of the applicant' },
  { label: 'Recent Bank Statement', type: 'bank-statement', accept: '.pdf', optional: true }
];

export const DocumentsStep: React.FC = () => {
  const { documents, addOrReplaceDocument, removeDocument, customer, loan } = useWizardData();
  const { state } = useAltus();
  const { submitLoanApplication, uploadDocument } = useUATWorkflow();
  // Debug to ensure component is loaded and dependencies resolved
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[DocumentsStep] mount', { docCount: documents.length });
  }
  const { push } = useSnackbar();
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const documentsRef = useRef(documents);
  const activeIntervalsRef = useRef<number[]>([]);
  const applicationNumberRef = useRef<string | null>(null); // Store ApplicationNumber to reuse for all documents
  const pendingDocumentsRef = useRef<Map<string, { doc: UploadedDoc, base64: string, typeCode: string }>>(new Map()); // Store pending documents for retry

  // Keep ref synced with latest documents to avoid stale closure inside intervals
  useEffect(() => { documentsRef.current = documents; }, [documents]);

  // Cleanup intervals on unmount
  useEffect(() => () => {
    activeIntervalsRef.current.forEach(id => clearInterval(id));
    activeIntervalsRef.current = [];
  }, []);

  // Function to upload document to API after verification
  const uploadToAPI = useCallback(async (doc: UploadedDoc) => {
    if (!doc.file) return;
    
    try {
      // Mark as uploading
      addOrReplaceDocument({ ...doc, status: 'uploading', progress: 0 });
      
      // Customer ID is now optional - we can proceed directly to loan application
      const customerId = customer.customerId || state.currentCustomer?.customerId;
      console.log('Debug: Customer ID for upload:', customerId || '(none - will use form data)');
      console.log('Debug: Wizard customer data:', customer);
      console.log('Debug: Altus context customer:', state.currentCustomer);
      
      // Map document type to UAT document type codes per API V2 docs
      const documentTypeMap: Record<UploadedDoc['type'], string> = {
        'nrc-front': 'SKIP',      // Will be merged with nrc-back
        'nrc-back': 'SKIP',       // Will be merged with nrc-front
        'combined-nrc': '6',      // NRC ID (Client) - merged front+back
        'payslip': 'SKIP',        // Individual payslips not uploaded
        'payslip-1': 'SKIP',      // Will be merged into combined-payslips
        'payslip-2': 'SKIP',      // Will be merged into combined-payslips
        'payslip-3': 'SKIP',      // Will be merged into combined-payslips
        'combined-payslips': '18', // Payslip (Last 3 months) - merged 3 payslips
        'reference-letter': '29',  // Employment Contract
        'work-id': '29',           // Employment Contract
        'selfie': '17',            // Passport (closest match for photo ID)
        'bank-statement': '30'     // Order Copies (supporting financial docs)
      };
      
      const documentTypeCode = documentTypeMap[doc.type] || '6';
      
      // Skip upload for individual NRC and payslip documents (will be uploaded as merged)
      if (documentTypeCode === 'SKIP') {
        console.log(`⏭️ Skipping individual upload for ${doc.type} - will be uploaded as merged document`);
        addOrReplaceDocument({ ...doc, status: 'verified', progress: 100 });
        return;
      }
      
      // Step 1: Get or create ApplicationNumber
      // IMPORTANT: Backend requires MANUAL APPROVAL before ApplicationNumber is active
      // Documents are stored locally and will be uploaded after approval
      let applicationNumber = applicationNumberRef.current;
      
      if (!applicationNumber) {
        console.log('🚀 Step 1: Submitting loan application for approval...');
        applicationNumber = await submitLoanApplication();
        applicationNumberRef.current = applicationNumber; // Store for reuse
        console.log('✅ Got ApplicationNumber:', applicationNumber);
        console.log('⏳ Waiting for backend approval before document upload (storing locally)...');
      } else {
        console.log('♻️ Reusing existing ApplicationNumber:', applicationNumber);
      }
      
      // Step 2: Attempt document upload (will be stored locally if pending approval)
      console.log('📤 Step 2: Attempting document upload...');
      
      try {
        const response = await uploadDocument(applicationNumber, documentTypeCode, doc.file);
        
        // Upload successful - remove from pending queue if it was there
        pendingDocumentsRef.current.delete(doc.type);
        
        // Update document with API response
        addOrReplaceDocument({ 
          ...doc, 
          id: response,
          status: 'uploaded', 
          progress: 100 
        });
        
        push(`${doc.type.replace('-', ' ')} uploaded successfully!`, 'success');
      } catch (uploadError: any) {
        // Check if error is "Application Number does not exists" - this means pending approval
        const isPendingApproval = uploadError?.message?.includes('Application Number does not exists') || 
                                   uploadError?.details?.executionMessage?.includes('Application Number does not exists');
        
        if (isPendingApproval) {
          // This is expected - loan is pending approval
          // Store the document data for retry after approval
          console.log('ℹ️ Loan application pending approval. Storing document for retry:', doc.type);
          
          // Convert file to base64 to store it
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            pendingDocumentsRef.current.set(doc.type, { 
              doc, 
              base64, 
              typeCode: documentTypeCode 
            });
            
            // Update pending count immediately
            const newCount = pendingDocumentsRef.current.size;
            setPendingCount(newCount);
            console.log(`📦 Stored ${doc.type} locally. Total pending: ${newCount}`);
          };
          reader.readAsDataURL(doc.file);
          
          addOrReplaceDocument({ 
            ...doc, 
            status: 'uploaded', // Mark as uploaded (pending in queue)
            progress: 100,
            id: `pending-${Date.now()}` // Temporary ID
          });
          
          push(`${doc.type.replace('-', ' ')} ready. Will upload after loan approval.`, 'info');
        } else {
          // Actual upload error - re-throw to outer catch
          throw uploadError;
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Upload failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addOrReplaceDocument({ 
        ...doc, 
        status: 'error', 
        errorMessage 
      });
      
      push(`Failed to upload ${doc.type.replace('-', ' ')}. ${errorMessage}`, 'error');
    }
  }, [addOrReplaceDocument, state.currentCustomer, customer, submitLoanApplication, uploadDocument, push]);

  const onSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: UploadedDoc['type']) => {
    console.log('Debug: File selection started for type:', type);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('Debug: No file selected');
      return;
    }
    
    console.log('Debug: File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Create renamed file with document name and client's NRC
    const getFileExtension = (filename: string) => {
      const lastDot = filename.lastIndexOf('.');
      return lastDot !== -1 ? filename.substring(lastDot) : '';
    };
    
    const getDocumentDisplayName = (docType: UploadedDoc['type']) => {
      const docConfig = docTypes.find(d => d.type === docType);
      return docConfig?.label.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || docType;
    };
    
    const clientNRC = customer?.nrc || 'Unknown_NRC';
    const sanitizedNRC = typeof clientNRC === 'string' ? clientNRC.replace(/[^\w]/g, '') : String(clientNRC).replace(/[^\w]/g, '');
    const documentName = getDocumentDisplayName(type);
    const fileExtension = getFileExtension(file.name);
    const newFileName = `${documentName}_${sanitizedNRC}${fileExtension}`;
    
    // Create a new file object with the renamed filename
    const renamedFile = new File([file], newFileName, { type: file.type });
    
    console.log('Debug: Starting file validation for:', renamedFile.name);
    const pre = await preValidateFile(renamedFile);
    console.log('Debug: File validation result:', pre);
    
    if (!pre.ok) {
      console.log('Debug: File validation failed:', pre.error);
      push(pre.error || 'File rejected', 'error');
      addOrReplaceDocument({ file: renamedFile, type, status: 'error', errorMessage: pre.error });
      return;
    }
    const existingDup = documents.find(d => d.checksumSha256 && d.checksumSha256 === pre.meta?.checksum && d.type !== type);
    if (existingDup) {
      push('This file appears already uploaded under a different document type.', 'warning');
      addOrReplaceDocument({ file: renamedFile, type, status: 'error', errorMessage: 'Duplicate of another document', checksumSha256: pre.meta?.checksum });
      return;
    }
    const previewUrl = renamedFile.type.startsWith('image/') ? URL.createObjectURL(renamedFile) : undefined;
    addOrReplaceDocument({ file: renamedFile, type, status: 'verifying', previewUrl, mimeType: pre.meta?.mimeType, sizeBytes: pre.meta?.sizeBytes, checksumSha256: pre.meta?.checksum, progress: 0 });
    const start = Date.now();
    const sizeFactor = Math.min(1.8, Math.max(1, (pre.meta!.sizeBytes / (1024 * 1024))));
    const interval = window.setInterval(async () => {
      const current = documentsRef.current.find(d => d.type === type);
      if (!current) return;
      const elapsed = Date.now() - start;
      const pct = Math.min(95, Math.round((elapsed / (1200 * sizeFactor)) * 100));
      addOrReplaceDocument({ ...current, progress: pct });
      if (pct >= 95) {
        clearInterval(interval);
        activeIntervalsRef.current = activeIntervalsRef.current.filter(id => id !== interval);
        
        // Safely attempt OCR with error handling
        let ocr = null;
        try {
          ocr = await attemptOcr(renamedFile);
        } catch (ocrError) {
          console.warn('OCR processing failed for file:', renamedFile.name, ocrError);
        }
        
        let notes = 'Basic checks passed';
        if (ocr?.detectedNrc && type === 'nrc-front') {
          // Get NRC from customer data
          const customerNrc = customer?.nrc;
          
          if (customerNrc && customerNrc.trim().length > 0) {
            // Normalize both NRCs for comparison - remove slashes, spaces, hyphens
            const normalizeNrc = (nrc: string) => nrc.replace(/[/\s\-]/g, '').toLowerCase().trim();
            const detectedNormalized = normalizeNrc(ocr.detectedNrc);
            const customerNormalized = normalizeNrc(String(customerNrc));
            
            const isMatch = detectedNormalized === customerNormalized;
            notes += isMatch ? ' | NRC match confirmed' : ` | NRC mismatch (detected: ${ocr.detectedNrc}, expected: ${customerNrc})`;
            
            console.log('NRC Validation:', {
              detected: ocr.detectedNrc,
              detectedNormalized,
              customer: customerNrc,
              customerNormalized,
              match: isMatch
            });
          } else {
            console.log('NRC Validation: Customer NRC not available for comparison, detected:', ocr.detectedNrc);
            notes += ` | NRC detected: ${ocr.detectedNrc} (no customer NRC to compare)`;
          }
        }
        
        const verifiedDoc = { 
          file: renamedFile, 
          type, 
          status: 'verified' as const, 
          previewUrl, 
          mimeType: pre.meta?.mimeType, 
          sizeBytes: pre.meta?.sizeBytes, 
          checksumSha256: pre.meta?.checksum, 
          extractedTextSnippet: ocr?.snippet, 
          verificationNotes: notes, 
          progress: 100 
        };
        
        addOrReplaceDocument(verifiedDoc);
        push('Document verified', 'success');
        
        // Upload to API after verification
        setTimeout(() => uploadToAPI(verifiedDoc), 500);
      }
    }, 150);
    activeIntervalsRef.current.push(interval);
  }, [addOrReplaceDocument, documents, push, customer, uploadToAPI]);
  
  const checkAndMergePayslips = useCallback(async () => {
    const payslip1 = documents.find(d => d.type === 'payslip-1' && d.status === 'verified');
    const payslip2 = documents.find(d => d.type === 'payslip-2' && d.status === 'verified');
    const payslip3 = documents.find(d => d.type === 'payslip-3' && d.status === 'verified');
    
    // Check if all payslips are verified and none are already merged
    if (payslip1 && payslip2 && payslip3 && 
        payslip1.file && payslip2.file && payslip3.file &&
        !documents.find(d => d.type === 'combined-payslips')) {
      
      try {
        push('Merging payslips into single document...', 'info');
        
        const clientNRC = customer?.nrc || 'Unknown_NRC';
        const mergedFile = await mergePayslips(payslip1.file, payslip2.file, payslip3.file, String(clientNRC));
        
        // Add the merged document
        const mergedDoc = {
          file: mergedFile,
          type: 'combined-payslips' as UploadedDoc['type'],
          status: 'verified' as const,
          mimeType: 'application/pdf',
          sizeBytes: mergedFile.size,
          verificationNotes: 'Combined from 3 individual payslips',
          progress: 100
        };
        
        addOrReplaceDocument(mergedDoc);
        
        push('Payslips successfully merged into single document', 'success');
        
        // Upload merged document to API
        setTimeout(() => uploadToAPI(mergedDoc), 500);
      } catch (error) {
        console.error('Failed to merge payslips:', error);
        push('Failed to merge payslips - individual files preserved', 'error');
      }
    }
  }, [documents, customer, addOrReplaceDocument, push, uploadToAPI]);
  
  // NRC merging function
  const checkAndMergeNRC = useCallback(async () => {
    const nrcFront = documents.find(d => d.type === 'nrc-front' && d.status === 'verified');
    const nrcBack = documents.find(d => d.type === 'nrc-back' && d.status === 'verified');
    
    // Check if both NRC front and back are verified and not already merged
    if (nrcFront && nrcBack && 
        nrcFront.file && nrcBack.file &&
        !documents.find(d => d.type === 'combined-nrc')) {
      
      try {
        push('Merging NRC front and back into single document...', 'info');
        
        const clientNRC = customer?.nrc || 'Unknown_NRC';
        const mergedFile = await mergeNRCImages(nrcFront.file, nrcBack.file, String(clientNRC));
        
        // Add the merged document
        const mergedDoc = {
          file: mergedFile,
          type: 'combined-nrc' as UploadedDoc['type'],
          status: 'verified' as const,
          mimeType: 'application/pdf',
          sizeBytes: mergedFile.size,
          verificationNotes: 'Combined NRC front and back',
          progress: 100
        };
        
        addOrReplaceDocument(mergedDoc);
        
        push('NRC documents successfully merged', 'success');
        
        // Upload merged document to API
        setTimeout(() => uploadToAPI(mergedDoc), 500);
      } catch (error) {
        console.error('Failed to merge NRC documents:', error);
        push('Failed to merge NRC documents - individual files preserved', 'error');
      }
    }
  }, [documents, customer, addOrReplaceDocument, push, uploadToAPI]);
  
  // Check for payslip merge when documents change
  useEffect(() => {
    const payslipTypes = ['payslip-1', 'payslip-2', 'payslip-3'];
    const verifiedPayslips = payslipTypes.filter(type => 
      documents.find(d => d.type === type && d.status === 'verified')
    );
    
    // If all 3 payslips are verified and no merged document exists, trigger merge
    if (verifiedPayslips.length === 3 && !documents.find(d => d.type === 'combined-payslips')) {
      checkAndMergePayslips();
    }
  }, [documents, checkAndMergePayslips]);
  
  // Check for NRC merge when documents change
  useEffect(() => {
    const nrcFront = documents.find(d => d.type === 'nrc-front' && d.status === 'verified');
    const nrcBack = documents.find(d => d.type === 'nrc-back' && d.status === 'verified');
    
    // If both NRC documents are verified and no merged document exists, trigger merge
    if (nrcFront && nrcBack && !documents.find(d => d.type === 'combined-nrc')) {
      checkAndMergeNRC();
    }
  }, [documents, checkAndMergeNRC]);
  
  const docsByType = useCallback((t: UploadedDoc['type']) => documents.find(d => d.type === t), [documents]);
  const openPicker = (type: UploadedDoc['type']) => {
    console.log('Debug: Opening file picker for type:', type);
    const input = fileInputs.current[type];
    console.log('Debug: File input element:', input);
    if (input) {
      input.click();
      console.log('Debug: File picker clicked');
    } else {
      console.error('Debug: File input not found for type:', type);
    }
  };

  (window as any).__documentsStepValidate = async () => {
    const required: UploadedDoc['type'][] = ['nrc-front','payslip-1','payslip-2','payslip-3'];
    const missing = required.filter(r => !docsByType(r));
    if (missing.length) { push('Please upload all required documents: ' + missing.join(', '), 'error'); return false; }
    
    // Check if payslips are still verifying (informational only - don't block)
    const payslipTypes = ['payslip-1','payslip-2','payslip-3'] as const;
    const payslipsVerifying = payslipTypes.some(p => docsByType(p)?.status === 'verifying');
    if (payslipsVerifying) { 
      push('✓ Payslips are being verified. You can proceed to Review - verification will continue in background.', 'info'); 
    }
    
    // Check for NRC mismatch (warning only - don't block)
    const nrcDoc = docsByType('nrc-front');
    const mism = nrcDoc?.verificationNotes?.includes('mismatch');
    if (mism) push('Warning: NRC mismatch detected – please verify ID number.', 'warning');
    
    // Inform user about pending approval if applicable
    if (!applicationNumberRef.current) {
      push('✓ Documents saved. You can proceed to Review while waiting for loan approval.', 'info');
    }
    
    return true;
  };

  // Retry uploading pending documents
  const retryPendingUploads = useCallback(async () => {
    if (!applicationNumberRef.current || pendingDocumentsRef.current.size === 0) {
      push('No pending documents to retry', 'info');
      return;
    }

    console.log(`🔄 Retrying ${pendingDocumentsRef.current.size} pending document(s)...`);
    push(`Retrying ${pendingDocumentsRef.current.size} pending document(s)...`, 'info');

    const pendingArray = Array.from(pendingDocumentsRef.current.entries());
    
    for (const [docType, { doc, typeCode }] of pendingArray) {
      if (!doc.file) continue;
      
      try {
        console.log(`🔄 Retrying upload for: ${docType}`);
        addOrReplaceDocument({ ...doc, status: 'uploading', progress: 50 });
        
        const response = await uploadDocument(applicationNumberRef.current, typeCode, doc.file);
        
        // Success - remove from pending
        pendingDocumentsRef.current.delete(docType);
        
        addOrReplaceDocument({ 
          ...doc, 
          id: response,
          status: 'uploaded', 
          progress: 100 
        });
        
        push(`${docType.replace('-', ' ')} uploaded successfully!`, 'success');
      } catch (error: any) {
        console.error(`Failed to retry ${docType}:`, error);
        // Keep in pending queue for next retry
        addOrReplaceDocument({ 
          ...doc, 
          status: 'uploaded', // Keep as "uploaded" (pending)
          progress: 100 
        });
      }
    }

    if (pendingDocumentsRef.current.size === 0) {
      push('All documents uploaded successfully!', 'success');
      setPendingCount(0);
    } else {
      const remaining = pendingDocumentsRef.current.size;
      setPendingCount(remaining);
      push(`${remaining} document(s) still pending approval`, 'warning');
    }
  }, [uploadDocument, addOrReplaceDocument, push]);

  // Derived progress & group metrics
  const requiredArr: UploadedDoc['type'][] = ['nrc-front','payslip-1','payslip-2','payslip-3'];
  const requiredVerified = requiredArr.filter(t => docsByType(t)?.status === 'verified').length;
  const payslipDocs = useMemo(() => docTypes.filter(d => d.type.startsWith('payslip-')).map(cfg => ({ cfg, doc: docsByType(cfg.type) })), [docsByType]);
  const payslipsVerified = payslipDocs.filter(p => p.doc?.status === 'verified').length;
  const selfieDoc = docsByType('selfie');
  const overallPct = useMemo(() => Math.round((requiredVerified / requiredArr.length) * 100), [requiredVerified, requiredArr.length]);
  
  // Track pending documents count (refresh when documents change)
  const [pendingCount, setPendingCount] = React.useState(0);
  React.useEffect(() => {
    const count = pendingDocumentsRef.current.size;
    setPendingCount(count);
    console.log(`📊 Pending documents count updated: ${count}`);
  }, [documents]); // Re-check when documents array changes
  
  // Also update count after uploads complete
  const updatePendingCount = useCallback(() => {
    const count = pendingDocumentsRef.current.size;
    setPendingCount(count);
    console.log(`📊 Pending documents count: ${count}`);
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Supporting Documents</Typography>
      
      {/* Pending Documents Warning Banner */}
      {pendingCount > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2,
            border: '2px solid',
            borderColor: 'warning.main',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.2)'
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={retryPendingUploads}
              sx={{ 
                whiteSpace: 'nowrap',
                fontWeight: 700,
                bgcolor: 'warning.dark',
                color: 'white',
                '&:hover': {
                  bgcolor: 'warning.main'
                }
              }}
            >
              🔄 Retry Upload ({pendingCount})
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            ⏳ {pendingCount} Document(s) Awaiting Backend Approval
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            <strong>Application Number: {applicationNumberRef.current}</strong>
            <br />
            Your loan application requires manual approval from the Altus system administrator before documents can be uploaded. 
            All documents are saved securely in your browser.
            <br />
            <strong>What happens next:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Administrator reviews your loan application ({applicationNumberRef.current})</li>
              <li>Once approved, click "Retry Upload" to upload all pending documents</li>
              <li>You can close this page and return later - your documents are saved locally</li>
            </ul>
            <em>Approval typically takes 5-15 minutes during business hours.</em>
          </Typography>
        </Alert>
      )}
      
      {/* Loan Approval Status Alert */}
      {applicationNumberRef.current && pendingCount === 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            📋 Loan Application: {applicationNumberRef.current}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            <strong>Status:</strong> Pending backend approval by Altus administrator.
            <br />
            Continue uploading documents - they will be stored locally and uploaded automatically after approval.
          </Typography>
        </Alert>
      )}
      
      {/* Customer Notice */}
      {!state.currentCustomer?.customerId && !customer?.customerId && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            ⚡ Fast Track Mode Active
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Skip creating a customer account - just fill the form in Step 1 and Step 2, then upload documents here. 
            Your loan application will be created automatically using your form data.
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ mb:2, p:2, border:'1px solid', borderColor:'divider', borderRadius:2, background: overallPct === 100 ? 'linear-gradient(90deg,#093B18,#2E7D32)' : 'linear-gradient(90deg,#132F52,#063970)', color:'#fff' }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1.5} alignItems={{ xs:'flex-start', sm:'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight:600 }}>Required Docs: {requiredVerified}/{requiredArr.length} verified</Typography>
          <Box sx={{ flex:1, width:'100%', maxWidth:260 }}>
            <LinearProgress variant="determinate" value={overallPct} sx={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar':{ background:'#fff' } }} />
          </Box>
          <Typography variant="caption" sx={{ opacity:0.9 }}>{overallPct}%</Typography>
        </Stack>
      </Box>
      <Typography variant="body2" sx={{ mb:2 }}>Upload the required documents. You can replace a file by selecting it again.</Typography>
      <Stack spacing={3}>
        {docTypes.filter(d => !d.type.startsWith('payslip-')).map(cfg => {
          const existing = docsByType(cfg.type);
            const isSelfie = cfg.type === 'selfie';
            const mismatchWarning = cfg.type === 'nrc-front' && existing?.verificationNotes?.includes('mismatch');
          return (
            <Box key={cfg.type} sx={{ p:2, border:'1px dashed', borderColor: mismatchWarning ? 'error.light' : 'divider', borderRadius:2, position:'relative' }}>
              {mismatchWarning && <Chip size="small" color="error" label="NRC Mismatch" sx={{ position:'absolute', top:8, right:8 }} />}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flex:1 }}>
                  <Typography variant="subtitle2">{cfg.label}</Typography>
                  {cfg.helper && <Typography variant="caption" sx={{ display:'block', color:'text.secondary', mt:0.25 }}>{cfg.helper}</Typography>}
                  {cfg.optional && !existing && <Typography variant="caption" sx={{ color:'text.secondary' }}>Optional</Typography>}
                  {existing ? (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt:1, flexWrap:'wrap' }}>
                      <Chip size="small" color={existing.status === 'verified' ? 'success' : existing.status === 'error' ? 'error' : existing.status === 'verifying' ? 'warning' : 'default'} label={existing.file?.name || existing.checksumSha256?.slice(0,8) || 'Document'} />
                      {existing.previewUrl && existing.file && (
                        <img src={existing.previewUrl} alt={cfg.label + ' preview'} style={{ width: isSelfie ? 60 : 48, height: isSelfie ? 60 : 48, objectFit:'cover', borderRadius: isSelfie ? '50%' : 6, border: isSelfie ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.15)' }} />
                      )}
                      <StatusChip status={existing.status} />
                      {existing.sizeBytes && <Tooltip title={`~${Math.round(existing.sizeBytes/1024)} KB`}><Chip size="small" variant="outlined" label={Math.round(existing.sizeBytes/1024)+' KB'} /></Tooltip>}
                      {typeof existing.progress === 'number' && existing.status !== 'verified' && (
                        <Box sx={{ width:140, ml:1 }}><LinearProgress variant="determinate" value={existing.progress} sx={{ height:6, borderRadius:3 }} /></Box>
                      )}
                      {existing.verificationNotes && existing.status === 'verified' && cfg.type === 'nrc-front' && (
                        <Tooltip title={existing.verificationNotes}><Chip size="small" variant="outlined" label={existing.verificationNotes.includes('mismatch') ? 'Mismatch' : 'Match'} color={existing.verificationNotes.includes('mismatch') ? 'error' : 'success'} /></Tooltip>
                      )}
                    </Stack>
                  ) : <Typography variant="caption" sx={{ color:'text.secondary' }}>No file selected</Typography>}
                </Box>
                <input type="file" ref={el => fileInputs.current[cfg.type] = el} accept={cfg.accept} style={{ display:'none' }} onChange={(e) => onSelect(e, cfg.type)} />
                <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => openPicker(cfg.type)}>{existing ? 'Replace' : 'Select'}</Button>
                {existing && <IconButton color="error" onClick={() => removeDocument(cfg.type)} aria-label={`Remove ${cfg.label}`}><DeleteIcon /></IconButton>}
              </Stack>
            </Box>
          );
        })}
        <Box sx={{ p:2, border:'1px solid', borderColor:'divider', borderRadius:2 }}>
          <Stack direction={{ xs:'column', sm:'row' }} alignItems={{ xs:'flex-start', sm:'center' }} spacing={2} sx={{ mb:1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight:600 }}>Payslips (3)</Typography>
            <Box sx={{ flex:1, width:'100%', maxWidth:240 }}><LinearProgress variant="determinate" value={(payslipsVerified/3)*100} sx={{ height:6, borderRadius:3 }} /></Box>
            <Typography variant="caption" sx={{ color:'text.secondary' }}>{payslipsVerified}/3 verified</Typography>
          </Stack>
          <Divider sx={{ mb:1 }} />
          <Stack spacing={2}>
            {payslipDocs.map(({ cfg, doc }) => (
              <Box key={cfg.type} sx={{ p:1.5, border:'1px dashed', borderColor:'divider', borderRadius:2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flex:1 }}>
                    <Typography variant="body2" sx={{ fontWeight:500 }}>{cfg.label}</Typography>
                    {cfg.helper && <Typography variant="caption" sx={{ color:'text.secondary' }}>{cfg.helper}</Typography>}
                    {doc ? (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt:0.75, flexWrap:'wrap' }}>
                        <Chip size="small" color={doc.status === 'verified' ? 'success' : doc.status === 'error' ? 'error' : doc.status === 'verifying' ? 'warning' : 'default'} label={doc.file?.name || doc.checksumSha256?.slice(0,8) || 'Payslip'} />
                        {doc.previewUrl && doc.file && <img src={doc.previewUrl} alt={cfg.label + ' preview'} style={{ width:42, height:42, objectFit:'cover', borderRadius:4 }} />}
                        <StatusChip status={doc.status} />
                        {typeof doc.progress === 'number' && doc.status !== 'verified' && (<Box sx={{ width:120 }}><LinearProgress variant="determinate" value={doc.progress} sx={{ height:5, borderRadius:3 }} /></Box>)}
                      </Stack>
                    ) : <Typography variant="caption" sx={{ color:'text.secondary' }}>No file selected</Typography>}
                  </Box>
                  <input type="file" ref={el => fileInputs.current[cfg.type] = el} accept={cfg.accept} style={{ display:'none' }} onChange={(e) => onSelect(e, cfg.type)} />
                  <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => openPicker(cfg.type)}>{doc ? 'Replace' : 'Select'}</Button>
                  {doc && <IconButton size="small" color="error" onClick={() => removeDocument(cfg.type)} aria-label={`Remove ${cfg.label}`}><DeleteIcon fontSize="small" /></IconButton>}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
        
        {/* Combined NRC Display */}
        {documents.find(d => d.type === 'combined-nrc') && (
          <Box sx={{ p:2, border:'2px solid', borderColor:'primary.light', borderRadius:2, background:'linear-gradient(90deg,#0d47a1,#1976d2)', color:'#fff', mb:2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1 }}>🪪 Combined NRC Document</Typography>
            {(() => {
              const combinedDoc = documents.find(d => d.type === 'combined-nrc');
              return combinedDoc ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flex:1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap:'wrap' }}>
                      <Chip 
                        size="small" 
                        color="primary" 
                        label={combinedDoc.file?.name || 'NRC_Combined.pdf'} 
                        sx={{ background:'rgba(255,255,255,0.9)', color:'#0d47a1' }}
                      />
                      <Chip 
                        size="small" 
                        variant="outlined" 
                        label="MERGED" 
                        sx={{ borderColor:'rgba(255,255,255,0.5)', color:'#fff' }}
                      />
                      {combinedDoc.sizeBytes && (
                        <Chip 
                          size="small" 
                          variant="outlined" 
                          label={`${Math.round(combinedDoc.sizeBytes/1024)} KB`}
                          sx={{ borderColor:'rgba(255,255,255,0.5)', color:'#fff' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ display:'block', mt:0.5, opacity:0.9 }}>
                      NRC front and back have been automatically combined into a single PDF document
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ color:'#fff' }} 
                    onClick={() => removeDocument('combined-nrc')} 
                    aria-label="Remove combined NRC"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null;
            })()}
          </Box>
        )}
        
        {/* Combined Payslips Display */}
        {documents.find(d => d.type === 'combined-payslips') && (
          <Box sx={{ p:2, border:'2px solid', borderColor:'success.light', borderRadius:2, background:'linear-gradient(90deg,#1b5e20,#2e7d32)', color:'#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1 }}>📄 Combined Payslips Document</Typography>
            {(() => {
              const combinedDoc = documents.find(d => d.type === 'combined-payslips');
              return combinedDoc ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flex:1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap:'wrap' }}>
                      <Chip 
                        size="small" 
                        color="success" 
                        label={combinedDoc.file?.name || 'Combined_Payslips.pdf'} 
                        sx={{ background:'rgba(255,255,255,0.9)', color:'#1b5e20' }}
                      />
                      <Chip 
                        size="small" 
                        variant="outlined" 
                        label="MERGED" 
                        sx={{ borderColor:'rgba(255,255,255,0.5)', color:'#fff' }}
                      />
                      {combinedDoc.sizeBytes && (
                        <Chip 
                          size="small" 
                          variant="outlined" 
                          label={`${Math.round(combinedDoc.sizeBytes/1024)} KB`}
                          sx={{ borderColor:'rgba(255,255,255,0.5)', color:'#fff' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ display:'block', mt:0.5, opacity:0.9 }}>
                      All three payslips have been automatically combined into a single PDF document
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ color:'#fff' }} 
                    onClick={() => removeDocument('combined-payslips')} 
                    aria-label="Remove combined payslips"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : null;
            })()}
          </Box>
        )}
      </Stack>
      <Typography variant="caption" sx={{ mt:3, display:'block', color:'text.secondary' }}>Files are stored locally until you submit. Verification here is preliminary.{selfieDoc ? '' : ' (Adding a selfie can speed up identity confirmation.)'}</Typography>
    </Box>
  );
};

const StatusChip: React.FC<{ status?: UploadedDoc['status'] }> = ({ status }) => {
  if (!status) return null;
  const map: Record<string, { color: 'default' | 'success' | 'warning' | 'error'; label: string; }> = {
    pending: { color: 'default', label: 'PENDING' },
    uploading: { color: 'warning', label: 'UPLOADING' },
    uploaded: { color: 'default', label: 'UPLOADED' },
    verifying: { color: 'warning', label: 'VERIFYING' },
    verified: { color: 'success', label: 'VERIFIED' },
    error: { color: 'error', label: 'ERROR' }
  };
  const meta = map[status];
  return <Chip size="small" variant="outlined" color={meta.color} label={meta.label} />;
};

export default DocumentsStep;

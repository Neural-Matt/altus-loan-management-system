import React, { useMemo, useEffect, useState } from 'react';
import { Box, Typography, Stack, IconButton, Chip, Paper, Tooltip, Divider, CircularProgress, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useWizard } from '../WizardContext';
import { useWizardData } from '../WizardDataContext';
import DownloadIcon from '@mui/icons-material/Download';
import { generateApplicationPDF } from '../../../utils/applicationPdfGenerator';

export const ReviewStep: React.FC = () => {
  const { goTo } = useWizard();
  const { customer, loan, documents } = useWizardData();

  (window as any).__reviewStepValidate = async () => true;

  const nrcFront = documents.find(d => d.type === 'nrc-front');
  const nrcBack = documents.find(d => d.type === 'nrc-back');
  const payslip1 = documents.find(d => d.type === 'payslip-1' || d.type === 'payslip'); // legacy 'payslip'
  const payslip2 = documents.find(d => d.type === 'payslip-2');
  const payslip3 = documents.find(d => d.type === 'payslip-3');
  const referenceLetter = documents.find(d => d.type === 'reference-letter');
  const workId = documents.find(d => d.type === 'work-id');
  const selfie = documents.find(d => d.type === 'selfie');
  const bank = documents.find(d => d.type === 'bank-statement');

  const anyMismatch = [nrcFront, nrcBack].some(d => d?.verificationNotes?.includes('mismatch'));
  const loanReady = !!(loan.amount && loan.tenureMonths && loan.emiResult);
  const docsReady = nrcFront?.status === 'verified' && nrcBack?.status === 'verified' && [payslip1,payslip2,payslip3].every(p => p?.status === 'verified');

  const readiness = useMemo(() => {
    const issues: string[] = [];
    if (!loanReady) issues.push('Loan calculation incomplete');
    if (!docsReady) issues.push('Required documents not fully verified');
    if (anyMismatch) issues.push('NRC mismatch detected');
    return { ok: issues.length === 0, issues };
  }, [loanReady, docsReady, anyMismatch]);

  // Progress percentage (simple weighting: loan 40, docs 40, mismatch resolved 20)
  const progressPct = useMemo(() => {
    let pct = 0;
    if (loanReady) pct += 40; else if (loan.amount || loan.tenureMonths) pct += 15;
    if (docsReady) pct += 40; else {
      const requiredList = [nrcFront, nrcBack, payslip1, payslip2, payslip3];
      const verifiedCount = requiredList.filter(d => d?.status === 'verified').length;
      pct += (verifiedCount / requiredList.length) * 40;
    }
    if (!anyMismatch) pct += 20; else if ((nrcFront || nrcBack)) pct += 5; // small credit if at least uploaded
    return Math.min(100, Math.round(pct));
  }, [loanReady, docsReady, anyMismatch, nrcFront, nrcBack, payslip1, payslip2, payslip3, loan.amount, loan.tenureMonths]);

  // Animated progress value
  const [animatedProgress, setAnimatedProgress] = useState(progressPct);
  useEffect(() => {
    if (progressPct === animatedProgress) return; // nothing to animate
    const start = animatedProgress;
    const end = progressPct;
    const duration = 600; // ms
    const startTime = performance.now();
    let frame: number;
    const easeOutCubic = (t:number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = start + (end - start) * easeOutCubic(t);
      setAnimatedProgress(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progressPct, animatedProgress]);

  // Snapshot & diff logic
  const [initialSnapshot, setInitialSnapshot] = useState(() => {
    if (typeof window === 'undefined') return null;
    const existing = sessionStorage.getItem('review_initial_snapshot');
    if (existing) return JSON.parse(existing);
    const snap = { customer, loan, documents: documents.map(d => ({ type:d.type, status:d.status })) };
    sessionStorage.setItem('review_initial_snapshot', JSON.stringify(snap));
    return snap;
  });

  const resetBaseline = () => {
    const snap = { customer, loan, documents: documents.map(d => ({ type:d.type, status:d.status })) };
    sessionStorage.setItem('review_initial_snapshot', JSON.stringify(snap));
    setInitialSnapshot(snap);
  };

  const diffs = useMemo(() => {
    if (!initialSnapshot) return [] as string[];
    const changes: string[] = [];
    // Customer diff
    ['firstName','lastName','email','phone','nrc'].forEach(k => {
      if ((customer as any)[k] !== (initialSnapshot.customer as any)[k]) changes.push(`Customer ${k} changed`);
    });
    // Loan diff
    ['amount','tenureMonths'].forEach(k => { if ((loan as any)[k] !== (initialSnapshot.loan as any)[k]) changes.push(`Loan ${k} changed`); });
    if (!!loan.emiResult !== !!initialSnapshot.loan.emiResult) changes.push('Loan calculation state updated');
    // Documents diff
    documents.forEach(d => {
      const prev = initialSnapshot.documents.find((p:any) => p.type === d.type);
      if (!prev) changes.push(`Document added: ${d.type}`);
      else if (prev.status !== d.status) changes.push(`Document ${d.type} status: ${prev.status} → ${d.status}`);
    });
    return changes;
  }, [initialSnapshot, customer, loan, documents]);

  const metricInfo: Record<string,string> = {
    Principal: 'Original loan amount you are requesting.',
    Monthly: 'Estimated monthly repayment (principal + interest).',
    'Total Interest': 'Total interest payable over the loan term.',
    'Total Payable': 'Principal plus total interest.'
  };
  const Metric: React.FC<{ label: string; value: React.ReactNode; accent?: boolean; }> = ({ label, value, accent }) => (
    <Tooltip title={metricInfo[label] || ''} placement="top" arrow>
      <Box sx={{ p:1.5, flex:1, minWidth:140, cursor:'help', borderRadius:2, '&:hover':{ background:'rgba(0,0,0,0.04)' } }}>
        <Typography variant="caption" sx={{ letterSpacing:0.5, color:'text.secondary' }}>{label.toUpperCase()}</Typography>
        <Typography variant={accent ? 'h6' : 'subtitle1'} sx={{ fontWeight:700, mt:0.5 }}>{value}</Typography>
      </Box>
    </Tooltip>
  );

  const SectionCard: React.FC<{ title: string; icon: React.ReactNode; onEdit: () => void; children: React.ReactNode; }>=({ title, icon, onEdit, children }) => (
    <Paper elevation={0} sx={{ p:2.5, border:'1px solid', borderColor:'divider', borderRadius:3, position:'relative' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width:34, height:34, borderRadius:'50%', bgcolor:'primary.main', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {icon}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight:600 }}>{title}</Typography>
        </Stack>
        <Tooltip title="Edit section"><IconButton size="small" onClick={onEdit}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
      </Stack>
      <Divider sx={{ mb:2 }} />
      {children}
    </Paper>
  );

  const renderDocChip = (doc?: typeof documents[number], label?: string) => {
    if (!doc) return <Chip size="small" label={`${label || 'Document'} Missing`} color="default" variant="outlined" />;
    const mismatch = doc.verificationNotes?.includes('mismatch');
    return (
      <Tooltip title={doc.verificationNotes || ''}>
        <Chip
          size="small"
            label={(label || doc.type) + (mismatch ? ' • Mismatch' : '')}
            color={doc.status === 'verified' ? (mismatch ? 'error' : 'success') : doc.status === 'verifying' ? 'warning' : doc.status === 'error' ? 'error' : 'default'}
            variant={doc.status === 'verified' ? 'filled' : 'outlined'}
          />
      </Tooltip>
    );
  };

  const jumpFirstIssue = () => {
    if (readiness.ok) return;
    if (!loanReady) return goTo(1); // calculator step index
    if (!docsReady || anyMismatch) return goTo(2);
  };

  const exportSummary = () => {
    try {
      const summaryData = {
        generatedAt: new Date().toISOString(),
        customer,
        loan,
        documents: documents.map(d => ({ type: d.type, status: d.status, notes: d.verificationNotes })),
        readiness
      };
      
      const pdfFile = generateApplicationPDF(summaryData);
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement('a');
      a.href = url; 
      a.download = pdfFile.name; 
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // Fallback to JSON if PDF generation fails
      const summary = {
        generatedAt: new Date().toISOString(),
        customer,
        loan,
        documents: documents.map(d => ({ type: d.type, status: d.status, notes: d.verificationNotes })),
        readiness
      };
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'application-summary.json'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Box>
      <Box onClick={jumpFirstIssue} sx={{ mb:3, p:2.5, borderRadius:3, background: readiness.ok ? 'linear-gradient(90deg,#093B18,#2E7D32)' : 'linear-gradient(90deg,#4a1c00,#b54708)' , color:'#fff', display:'flex', alignItems:'center', gap:2, flexWrap:'wrap', cursor: readiness.ok ? 'default':'pointer', position:'relative' }}>
        {readiness.ok ? <CheckCircleOutlineIcon /> : <WarningAmberIcon />}
        <Box sx={{ flex:1, minWidth:240 }}>
          <Typography variant="subtitle1" sx={{ fontWeight:700 }}>{readiness.ok ? 'All Sections Ready' : 'Action Recommended (click to jump)'}</Typography>
          {!readiness.ok && (
            <Typography variant="caption" sx={{ opacity:0.9, display:'block', mt:0.5 }}>
              {readiness.issues.join(' • ')}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ position:'relative', width:42, height:42 }}>
            <CircularProgress size={42} variant="determinate" value={100} sx={{ color:'rgba(255,255,255,0.25)', position:'absolute', left:0, top:0 }} />
            <CircularProgress size={42} variant="determinate" value={animatedProgress} sx={{ color:'#fff', transition:'none' }} />
            <Box sx={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Typography variant="caption" sx={{ fontSize:10, fontWeight:700 }}>{Math.round(animatedProgress)}%</Typography>
            </Box>
          </Box>
          <Tooltip title="Download summary JSON"><span><IconButton size="small" color="inherit" onClick={(e)=>{ e.stopPropagation(); exportSummary(); }}><DownloadIcon fontSize="small" /></IconButton></span></Tooltip>
        </Stack>
      </Box>
      <Box sx={{ display:'grid', gap:3, gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' } }}>
        <Box>
          <SectionCard title="Customer" icon={<PersonOutlineIcon fontSize="small" />} onEdit={() => goTo(0)}>
            <Stack spacing={0.75}>
              <Typography variant="body2"><strong>Name:</strong> {customer.firstName || '-'} {customer.lastName || ''}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {customer.email || '-'}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {customer.phone || '-'}</Typography>
              <Typography variant="body2"><strong>NRC:</strong> {customer.nrc || '-'}</Typography>
            </Stack>
          </SectionCard>
        </Box>
        <Box>
          <SectionCard title="Loan" icon={<CalculateOutlinedIcon fontSize="small" />} onEdit={() => goTo(1)}>
            {loan.emiResult ? (
              <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mt:-1 }}>
                <Metric label="Principal" value={`ZMW ${loan.amount?.toLocaleString()}`} accent />
                <Metric label="Monthly" value={`ZMW ${loan.emiResult.monthlyInstallment.toLocaleString()}`} />
                <Metric label="Total Interest" value={`ZMW ${loan.emiResult.totalInterest.toLocaleString()}`} />
                <Metric label="Total Payable" value={`ZMW ${loan.emiResult.totalPayable.toLocaleString()}`} />
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color:'text.secondary' }}>Loan calculation not completed.</Typography>
            )}
            <Box sx={{ mt:1.5 }}>
              <Typography variant="caption" sx={{ color:'text.secondary' }}>Tenure: {loan.tenureMonths || '-'} months</Typography>
            </Box>
          </SectionCard>
        </Box>
        <Box sx={{ gridColumn:{ md:'1 / span 2' } }}>
          <SectionCard title="Documents" icon={<FolderOpenIcon fontSize="small" />} onEdit={() => goTo(2)}>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb:1 }}>
              {renderDocChip(nrcFront, 'NRC Front')}
              {renderDocChip(nrcBack, 'NRC Back')}
              {renderDocChip(payslip1, 'Payslip 1')}
              {renderDocChip(payslip2, 'Payslip 2')}
              {renderDocChip(payslip3, 'Payslip 3')}
              {renderDocChip(referenceLetter, 'Ref Letter')}
              {renderDocChip(workId, 'Work ID')}
              {renderDocChip(selfie, 'Selfie')}
              {renderDocChip(bank, 'Bank Statement')}
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt:1 }}>
              {nrcFront?.previewUrl && (
                <Box sx={{ textAlign:'center' }}>
                  <img src={nrcFront.previewUrl} alt="NRC Front" style={{ width:90, height:60, objectFit:'cover', borderRadius:6, border:'1px solid rgba(0,0,0,0.15)' }} />
                  <Typography variant="caption" sx={{ display:'block', mt:0.5 }}>Front</Typography>
                </Box>
              )}
              {nrcBack?.previewUrl && (
                <Box sx={{ textAlign:'center' }}>
                  <img src={nrcBack.previewUrl} alt="NRC Back" style={{ width:90, height:60, objectFit:'cover', borderRadius:6, border:'1px solid rgba(0,0,0,0.15)' }} />
                  <Typography variant="caption" sx={{ display:'block', mt:0.5 }}>Back</Typography>
                </Box>
              )}
            </Stack>
            <Typography variant="caption" sx={{ mt:1.5, display:'block', color:'text.secondary' }}>
              Documents are preliminarily verified client-side; final validation occurs after submission.
            </Typography>
          </SectionCard>
        </Box>
      </Box>
      {/* Risks & Changes Section */}
      <Box sx={{ mt:4, display:'grid', gap:3, gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' } }}>
        <Paper elevation={0} sx={{ p:2.5, border:'1px solid', borderColor:'divider', borderRadius:3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1 }}>Risks / Flags</Typography>
          {readiness.issues.length === 0 && <Typography variant="caption" sx={{ color:'text.secondary' }}>No outstanding issues.</Typography>}
          <Stack spacing={0.75}>
            {readiness.issues.map((iss,i)=>(
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <WarningAmberIcon fontSize="inherit" style={{ color:'#b54708', fontSize:16 }} />
                <Typography variant="caption">{iss}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ p:2.5, border:'1px solid', borderColor:'divider', borderRadius:3, position:'relative' }}>
          <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1 }}>Changes Since Opening</Typography>
          {diffs.length === 0 && <Typography variant="caption" sx={{ color:'text.secondary' }}>No changes recorded this session.</Typography>}
          <Stack spacing={0.5}>
            {diffs.map((d,i)=>(<Typography key={i} variant="caption">• {d}</Typography>))}
          </Stack>
          <Box sx={{ mt:1.5 }}>
            <Button size="small" variant="text" onClick={resetBaseline} disabled={diffs.length===0}>Reset Baseline</Button>
          </Box>
        </Paper>
      </Box>
  <Paper elevation={0} sx={{ mt:4, p:2.5, borderRadius:3, border:'1px solid', borderColor:'divider', background:'linear-gradient(90deg,#011A41 0%, #07306E 60%)', color:'#fff' }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2} alignItems={{ xs:'flex-start', sm:'center' }}>
          <DescriptionIcon />
          <Box sx={{ flex:1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight:600 }}>Declaration</Typography>
            <Typography variant="caption" sx={{ display:'block', mt:0.5, opacity:0.9 }}>
              By submitting you confirm the information is accurate and you consent to processing for loan assessment.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

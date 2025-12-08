import React, { useEffect, useState, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Typography, Box, Breadcrumbs, Link as MuiLink, Tooltip, IconButton, Alert, Button, Stack } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { Pill } from '../components/common/Pill';
import { MultiStepWizard } from '../components/wizard/MultiStepWizard';
import { WizardDataProvider, useWizardData } from '../components/wizard/WizardDataContext';
import { useAltus } from '../context/AltusContext';
import { loadDraft, clearDraft } from '../utils/draftStorage';
import { useSnackbar } from '../components/feedback/SnackbarProvider';

// Wrap named exports so React.lazy receives a component with default export
const CustomerStep = React.lazy(() => import('../components/wizard/steps/CustomerStep').then(m => ({ default: m.CustomerStep })));
const CalculatorStep = React.lazy(() => import('../components/wizard/steps/CalculatorStep').then(m => ({ default: m.CalculatorStep })));
const DocumentsStep = React.lazy(() => import('../components/wizard/steps/DocumentsStep').then(m => ({ default: m.DocumentsStep })));
const ReviewStep = React.lazy(() => import('../components/wizard/steps/ReviewStep').then(m => ({ default: m.ReviewStep })));
const ConfirmationStep = React.lazy(() => import('../components/wizard/steps/ConfirmationStep').then(m => ({ default: m.ConfirmationStep })));

const WizardContent: React.FC<{ steps:any; validators:any; }> = ({ steps, validators }) => {
  const { hydrate, customer, loan, documents, setLoan } = useWizardData();
  const { submitLoanRequest, state } = useAltus();
  const { push } = useSnackbar();
  const [initialIndex, setInitialIndex] = useState<number | undefined>(undefined);
  const [draftMeta, setDraftMeta] = useState<{ savedAt: string } | null>(null);

  const handleSubmit = async () => {
    try {
      // Check if customer was created
      const customerId = state.currentCustomer?.customerId;
      if (!customerId) {
        push('Customer must be created first. Please check step 2.', 'error');
        return;
      }

      // Prepare loan request data with ALL required fields from customer form
      const loanRequestData = {
        // Customer identification
        customerId,
        identityNo: customer.nrc || state.currentCustomer?.nrc || '',
        contactNo: customer.phone || state.currentCustomer?.phoneNumber || '',
        emailId: customer.email || state.currentCustomer?.emailAddress || '',
        
        // Employment details
        employeeNumber: customer.payrollNumber || customer.employerId || '',
        designation: customer.occupation || '',
        employmentType: customer.employmentType === 'Permanent' ? '1' : customer.employmentType === 'Contract' ? '2' : '1',
        
        // Loan details
        loanAmount: loan.amount || 0,
        tenure: loan.tenureMonths || 12,
        
        // Salary/Income details
        grossIncome: customer.salary || 0,
        netIncome: customer.salary ? customer.salary * 0.7 : 0, // Estimate 70% of gross as net
        deductions: customer.salary ? customer.salary * 0.3 : 0, // Estimate 30% deductions
        
        // Gender
        gender: customer.gender || state.currentCustomer?.gender || 'Male',
        
        // Additional fields (for backward compatibility)
        productCode: loan.productCode || 'INSTANT_SALARY',
        purpose: customer.purpose || 'Personal Use',
        monthlyInstallment: loan.emiResult?.monthlyInstallment || 0,
        totalInterest: loan.emiResult?.totalInterest || 0,
        totalPayable: loan.emiResult?.totalPayable || 0,
        
        // Next of Kin details
        kinName: customer.nextOfKin?.firstName ? `${customer.nextOfKin.firstName} ${customer.nextOfKin.lastName || ''}`.trim() : '',
        kinRelationship: customer.nextOfKin?.relationship || '',
        kinMobileNo: customer.nextOfKin?.phone || '',
        kinAddress: customer.nextOfKin?.address || '',
        kinNRC: customer.nextOfKin?.nrc || '',
        kinProvinceName: (customer.nextOfKin?.province || "").replace(" Province", ""),
        kinDistrictName: customer.nextOfKin?.city || '',
        kinCountryName: customer.nextOfKin?.country || 'Zambia',
        
        // Reference details
        referrerName: customer.reference?.name || '',
        referrerRelationType: customer.reference?.relationship || '',
        referrerContactNo: customer.reference?.phone || '',
        referrerPhysicalAddress: customer.reference?.address || '',
        referrerNRC: customer.reference?.nrc || '',
      };

      push('Submitting loan request...', 'info');
      
      // Submit the loan request and get the ApplicationNumber
      const result = await submitLoanRequest(loanRequestData);
      
      // Store the ApplicationNumber in loan data
      if (result && result.applicationNumber) {
        setLoan({ applicationNumber: result.applicationNumber });
        push(`Loan request submitted successfully! Application Number: ${result.applicationNumber}`, 'success');
      } else {
        push('Loan request submitted successfully!', 'success');
      }
      
      clearDraft(); // Clear the draft after successful submission
      
    } catch (error) {
      console.error('Error submitting loan request:', error);
      push('Failed to submit loan request. Please try again.', 'error');
    }
  };

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setDraftMeta({ savedAt: draft.savedAt });
    }
  }, []);

  const handleResume = () => {
    const draft = loadDraft();
    if (!draft) return;
    hydrate({ 
      customer: draft.customer, 
      loan: draft.loan, 
      documents: draft.documents as any // Type assertion needed due to draft storage loose typing
    });
    setInitialIndex(draft.activeIndex);
    setDraftMeta(null);
    push('Draft resumed from saved progress.', 'success');
  };

  const handleDiscard = () => {
    clearDraft();
    setDraftMeta(null);
    push('Saved draft discarded.', 'info');
  };

  return (
    <>
      {draftMeta && (
        <Alert severity="info" sx={{ mb:2 }} action={<Stack direction="row" spacing={1}>
          <Button color="inherit" size="small" onClick={handleResume}>Resume</Button>
          <Button color="inherit" size="small" onClick={handleDiscard}>Discard</Button>
        </Stack>}>
          A saved draft from {new Date(draftMeta.savedAt).toLocaleString()} was found.
        </Alert>
      )}
      <Suspense fallback={<Box sx={{ p:4 }}>Loading step...</Box>}>
        <MultiStepWizard
          steps={steps}
          validators={validators}
          initialActiveIndex={initialIndex}
          onFinish={handleSubmit}
        >
          <CustomerStep />
          <CalculatorStep />
          <DocumentsStep />
          <ReviewStep />
          <ConfirmationStep />
        </MultiStepWizard>
      </Suspense>
      <Typography variant="caption" sx={{ mt:4, display:'block', color:'text.secondary' }}>
        Draft saves include form data and document metadata. Document files must be re-uploaded after resuming.
      </Typography>
    </>
  );
};

export const WizardPage: React.FC = () => {
  const { category, product } = useParams();

  const steps = [
    { id: 'customer', title: 'Customer' },
    { id: 'calculator', title: 'Calculator' },
    { id: 'documents', title: 'Documents' },
    { id: 'review', title: 'Review' },
    { id: 'confirm', title: 'Confirmation' }
  ];

  const validators = [
    async () => {
      if ((window as any).__customerStepSubmit) {
        const ok = await (window as any).__customerStepSubmit();
        return ok !== false;
      }
      return true;
    },
    async () => {
      if ((window as any).__calculatorStepSubmit) {
        const ok = await (window as any).__calculatorStepSubmit();
        return ok !== false;
      }
      return true;
    },
    async () => {
      if ((window as any).__documentsStepValidate) {
        const ok = await (window as any).__documentsStepValidate();
        return ok !== false;
      }
      return true;
    },
    async () => {
      if ((window as any).__reviewStepValidate) {
        const ok = await (window as any).__reviewStepValidate();
        return ok !== false;
      }
      return true;
    },
    async () => {
      if ((window as any).__confirmationStepValidate) {
        const ok = await (window as any).__confirmationStepValidate();
        return ok !== false;
      }
      return true;
    }
  ];

  return (
    <AppLayout>
      <Typography variant="h4" gutterBottom>Loan Application</Typography>
      <WizardHeader category={category} product={product} />
      <WizardDataProvider>
        <WizardContent steps={steps} validators={validators} />
      </WizardDataProvider>
    </AppLayout>
  );
};

const WizardHeader: React.FC<{ category?: string; product?: string; }> = ({ category, product }) => {
  return (
    <Box sx={{ mb:4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color:'text.disabled' }} />} sx={{ mb:1.5 }}>
        <MuiLink component={Link} underline="hover" color="inherit" to="/">
          <HomeOutlinedIcon fontSize="inherit" style={{ verticalAlign:'middle', marginRight:4 }} /> Home
        </MuiLink>
        <MuiLink component={Link} underline="hover" color="inherit" to="/apply/personal/instant-salary-advance">Apply</MuiLink>
        {category && <Typography color="text.primary" variant="body2">{category}</Typography>}
        {product && <Typography color="text.primary" variant="body2">{product}</Typography>}
      </Breadcrumbs>
      <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.2, alignItems:'center' }}>
        <Pill label="Category" value={category} color="primary" icon={<CategoryOutlinedIcon sx={{ fontSize:16 }} />} />
        <Pill label="Product" value={product} icon={<LayersOutlinedIcon sx={{ fontSize:16 }} />} />
        <Tooltip title="Category & product determine available loan configuration. Verify before entering details." arrow>
          <IconButton size="small" sx={{ ml:0.5, color:'text.secondary' }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

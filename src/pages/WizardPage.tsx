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
  const { hydrate, customer, loan, documents } = useWizardData();
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

      // Prepare loan request data
      const loanRequestData = {
        customerId,
        loanAmount: loan.amount || 0,
        loanTenure: loan.tenureMonths || 0,
        productCode: loan.productCode || 'INSTANT_SALARY',
        purpose: customer.purpose || 'Personal Use',
        monthlyInstallment: loan.emiResult?.monthlyInstallment || 0,
        totalInterest: loan.emiResult?.totalInterest || 0,
        totalPayable: loan.emiResult?.totalPayable || 0,
        // Document IDs from uploaded documents
        documentIds: documents
          .filter(doc => doc.id && doc.status === 'uploaded')
          .map(doc => doc.id!)
      };

      push('Submitting loan request...', 'info');
      
      // Submit the loan request
      await submitLoanRequest(loanRequestData);
      
      push('Loan request submitted successfully!', 'success');
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

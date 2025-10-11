import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Stack } from '@mui/material';
import { useWizardData } from '../WizardDataContext';
import { isMockMode, mockSubmitApplication } from '../../../api/mockApi';

// Placeholder submission simulation; will be replaced with real API call.
const fakeSubmit = (): Promise<{ referenceId: string; status: string; }> =>
  new Promise(resolve => setTimeout(
    () => resolve({ referenceId: 'REF' + Math.floor(Math.random() * 1e6), status: 'PENDING_REVIEW' }),
    1200
  ));

export const ConfirmationStep: React.FC = () => {
  const { customer, loan, documents, resetAll } = useWizardData();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceId: string; status: string;} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      const applicationData = {
        customer,
        loan,
        documents: documents.map(d => ({ type: d.type, status: d.status })),
        submittedAt: new Date().toISOString()
      };
      const res = isMockMode() ? await mockSubmitApplication(applicationData) : await fakeSubmit();
      setResult({ referenceId: res.referenceId, status: res.status });
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  (window as any).__confirmationStepValidate = async () => true;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Confirmation</Typography>
      {result ? (
        <Box sx={{ p:2, bgcolor: 'background.paper', borderRadius:2, boxShadow:1 }}>
          <Typography variant="subtitle1" gutterBottom>Application Submitted</Typography>
          <Typography variant="body2">Reference ID: <strong>{result.referenceId}</strong></Typography>
          <Typography variant="body2" sx={{ mb:2 }}>Initial Status: <strong>{result.status}</strong></Typography>
          <Typography variant="caption" sx={{ display:'block', mb:2 }}>Use the tracking page with this reference ID to check updates.</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => resetAll()}>Start New Application</Button>
          </Stack>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ mb:2 }}>Click submit to send your application. A reference will be generated.</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" disabled={submitting} onClick={handleSubmit}>
              {submitting ? <><CircularProgress size={18} sx={{ mr:1 }} /> Submitting...</> : 'Submit Application'}
            </Button>
          </Stack>
          {error && <Typography color="error" sx={{ mt:2 }}>{error}</Typography>}
          <Typography variant="caption" sx={{ display:'block', mt:3, color:'text.secondary' }}>
            {isMockMode() ? 'Using mock submission mode (no network call).' : 'TODO: Replace with real API integration and optimistic status polling.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

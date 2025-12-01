import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWizardData } from '../WizardDataContext';

export const ConfirmationStep: React.FC = () => {
  const navigate = useNavigate();
  const { loan, resetAll } = useWizardData();

  // Check if we have an applicationNumber from successful submission
  const hasApplicationNumber = !!loan.applicationNumber;

  const handleTrackLoan = () => {
    // Navigate to tracking page with applicationNumber in the URL
    navigate(`/track?ref=${loan.applicationNumber}`);
  };

  (window as any).__confirmationStepValidate = async () => true;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Confirmation</Typography>
      {hasApplicationNumber ? (
        <Box sx={{ p:2, bgcolor: 'success.light', borderRadius:2, boxShadow:2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.dark' }}>✅ Application Submitted Successfully</Typography>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
            Application Number: <strong style={{ fontSize: '1.2em', color: '#2e7d32' }}>{loan.applicationNumber}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Your loan application has been submitted and is pending review. Use the tracking page with this Application Number to check updates on your loan status.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={handleTrackLoan}>Track Application Status</Button>
            <Button variant="outlined" onClick={() => resetAll()}>Start New Application</Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p:2, bgcolor: 'info.light', borderRadius:2, boxShadow:1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'info.dark' }}>📋 Final Review</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your application has been completed. The loan request has been submitted during the document upload step, and you should have received an Application Number.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            If you haven't seen the Application Number yet, please go back to the Documents step to complete the submission process.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/track')}>Go to Tracking Page</Button>
            <Button variant="outlined" onClick={() => resetAll()}>Start New Application</Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

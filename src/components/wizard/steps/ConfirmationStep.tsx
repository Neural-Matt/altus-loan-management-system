import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Card, CardContent, IconButton, Tooltip, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWizardData } from '../WizardDataContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import RefreshIcon from '@mui/icons-material/Refresh';

export const ConfirmationStep: React.FC = () => {
  const navigate = useNavigate();
  const { loan, resetAll } = useWizardData();
  const [copied, setCopied] = useState(false);

  // Check if we have an applicationNumber from successful submission
  const applicationId = loan.applicationId || loan.applicationNumber;
  const hasApplicationNumber = !!applicationId;

  const handleCopyToClipboard = async () => {
    if (applicationId) {
      try {
        await navigator.clipboard.writeText(applicationId);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleTrackLoan = () => {
    // Navigate to tracking page with applicationNumber in the URL
    navigate(`/track?ref=${applicationId}`);
  };

  const handleStartNew = () => {
    resetAll();
    navigate('/apply');
  };

  (window as any).__confirmationStepValidate = async () => true;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        {hasApplicationNumber ? '🎉 Application Submitted Successfully!' : '📋 Application Review'}
      </Typography>
      
      {hasApplicationNumber ? (
        <Stack spacing={3}>
          {/* Success Alert */}
          <Alert severity="success" icon={<CheckCircleIcon fontSize="large" />} sx={{ fontSize: '1.1em' }}>
            Your loan application has been successfully submitted and is now under review!
          </Alert>

          {/* Application ID Card */}
          <Card sx={{ bgcolor: 'primary.light', boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
                📝 Your Application ID
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  bgcolor: 'white', 
                  p: 2, 
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    flex: 1
                  }}
                >
                  {applicationId}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton 
                    onClick={handleCopyToClipboard}
                    color={copied ? 'success' : 'primary'}
                    size="large"
                  >
                    {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                ⚠️ <strong>Important:</strong> Save this Application ID! You'll need it to track your loan status.
              </Typography>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                📊 Current Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label="Under Review" 
                  color="warning" 
                  size="medium"
                  sx={{ fontSize: '1em', fontWeight: 'bold', px: 2, py: 3 }}
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Your application is currently being reviewed by our team.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You will receive updates via email and SMS<br />
                • Processing typically takes 1-3 business days<br />
                • Use the tracking page to check real-time status
              </Typography>
            </CardContent>
          </Card>

          {/* What's Next Card */}
          <Card sx={{ bgcolor: 'info.lighter', boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'info.dark', fontWeight: 'bold' }}>
                📌 What's Next?
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <ol style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Our team will review your application and documents</li>
                  <li>We may contact you if additional information is needed</li>
                  <li>Once approved, funds will be disbursed to your bank account</li>
                  <li>You'll receive confirmation and repayment schedule details</li>
                </ol>
              </Typography>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<TrackChangesIcon />}
              onClick={handleTrackLoan}
              fullWidth
            >
              Track Application Status
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleStartNew}
              fullWidth
            >
              Start New Application
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box>
          <Alert severity="warning" sx={{ mb: 3 }}>
            No Application ID found. Please complete the document upload step to submit your application.
          </Alert>
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'warning.dark' }}>
                📋 Application Not Yet Submitted
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your application has been completed, but the loan request has not been submitted yet.
                Please go back to the Documents step to complete the submission process.
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                The Application Number is generated during the document upload step when your
                loan request is officially submitted to ALTUS.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/track')}
                >
                  Go to Tracking Page
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleStartNew}
                >
                  Start New Application
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

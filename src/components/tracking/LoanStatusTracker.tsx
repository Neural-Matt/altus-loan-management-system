import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  Description as DocumentIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  AccountBalance as DisbursedIcon,
  Refresh as RefreshIcon,
  Cancel as RejectedIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAltus } from '../../context/AltusContext';
import { useSnackbar } from '../feedback/SnackbarProvider';

interface LoanStatusTrackerProps {
  loanId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  onStatusChange?: (status: string) => void;
}

interface StatusStep {
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'pending' | 'error';
}

const statusSteps = [
  {
    key: 'DOCUMENT_REVIEW',
    label: 'Document Review',
    description: 'Documents are being verified and reviewed',
    icon: <DocumentIcon />,
  },
  {
    key: 'PENDING',
    label: 'Pending Approval',
    description: 'Application is under review by loan officers',
    icon: <PendingIcon />,
  },
  {
    key: 'APPROVED',
    label: 'Approved',
    description: 'Loan has been approved and is ready for disbursement',
    icon: <ApprovedIcon />,
  },
  {
    key: 'DISBURSED',
    label: 'Disbursed',
    description: 'Loan amount has been disbursed to your account',
    icon: <DisbursedIcon />,
  },
];

const statusOrder = ['DOCUMENT_REVIEW', 'PENDING', 'APPROVED', 'DISBURSED'];

export const LoanStatusTracker: React.FC<LoanStatusTrackerProps> = ({
  loanId,
  autoRefresh = true,
  refreshInterval = 30,
  onStatusChange
}) => {
  const { fetchLoanStatus, state } = useAltus();
  const { push } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setIsLoading(true);
      }
      setError(null);

      await fetchLoanStatus(loanId);
      
      // Get the status from the context state
      const loanStatus = state.loanStatus?.status;
      if (loanStatus) {
        const previousStatus = currentStatus;
        setCurrentStatus(loanStatus);
        setLastUpdated(new Date());
        
        // Notify parent component of status change
        if (previousStatus && previousStatus !== loanStatus) {
          onStatusChange?.(loanStatus);
          push(`Loan status updated to: ${loanStatus}`, 'info');
        }
      }
    } catch (err) {
      console.error('Error fetching loan status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch loan status');
      push('Failed to fetch loan status', 'error');
    } finally {
      if (showLoadingIndicator) {
        setIsLoading(false);
      }
    }
  }, [loanId, fetchLoanStatus, state.loanStatus, currentStatus, onStatusChange, push]);

  // Initial fetch
  useEffect(() => {
    if (loanId) {
      fetchStatus();
    }
  }, [loanId, fetchStatus]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !loanId || currentStatus === 'DISBURSED' || currentStatus === 'REJECTED') {
      return;
    }

    const interval = setInterval(() => {
      fetchStatus(false); // Don't show loading indicator for auto-refresh
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loanId, currentStatus, fetchStatus]);

  const getStepStatus = (stepKey: string): 'completed' | 'active' | 'pending' | 'error' => {
    if (!currentStatus) return 'pending';
    
    if (currentStatus === 'REJECTED' && stepKey !== 'DOCUMENT_REVIEW') {
      return 'error';
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getActiveStep = (): number => {
    if (!currentStatus) return 0;
    if (currentStatus === 'REJECTED') return 0;
    return statusOrder.indexOf(currentStatus);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'DOCUMENT_REVIEW': return 'info';
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'DISBURSED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleManualRefresh = () => {
    fetchStatus();
  };

  if (error && !currentStatus) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleManualRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Loan Status Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loan ID: {loanId}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={2}>
          {currentStatus && (
            <Chip 
              label={currentStatus.replace('_', ' ')} 
              color={getStatusColor(currentStatus)}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          )}
          <Tooltip title="Refresh status">
            <IconButton 
              onClick={handleManualRefresh} 
              disabled={isLoading}
              size="small"
            >
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Status Timeline */}
      <Box sx={{ mb: 2 }}>
        <Stepper activeStep={getActiveStep()} orientation="vertical">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.key);
            const isRejected = currentStatus === 'REJECTED' && index > 0;
            
            return (
              <Step key={step.key} completed={stepStatus === 'completed'}>
                <StepLabel
                  icon={
                    isRejected ? (
                      <RejectedIcon color="error" />
                    ) : stepStatus === 'error' ? (
                      <ErrorIcon color="error" />
                    ) : (
                      step.icon
                    )
                  }
                  sx={{
                    '& .MuiStepLabel-iconContainer': {
                      color: stepStatus === 'completed' ? 'success.main' : 
                             stepStatus === 'active' ? 'primary.main' : 
                             stepStatus === 'error' || isRejected ? 'error.main' : 
                             'text.disabled'
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {isRejected ? 'Application was not approved at the review stage' : step.description}
                  </Typography>
                  {stepStatus === 'active' && (
                    <Chip 
                      size="small" 
                      label="In Progress" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                  {stepStatus === 'completed' && (
                    <Chip 
                      size="small" 
                      label="Completed" 
                      color="success" 
                      variant="outlined"
                    />
                  )}
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Footer Info */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {lastUpdated ? `Last updated: ${formatLastUpdated(lastUpdated)}` : 'Loading...'}
        </Typography>
        {autoRefresh && currentStatus !== 'DISBURSED' && currentStatus !== 'REJECTED' && (
          <Typography variant="caption" color="text.secondary">
            Auto-refresh: {refreshInterval}s
          </Typography>
        )}
      </Stack>

      {/* Additional Status Info */}
      {state.loanStatus && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Additional Details:
          </Typography>
          {state.loanStatus.statusDescription && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Description:</strong> {state.loanStatus.statusDescription}
            </Typography>
          )}
          {state.loanStatus.lastUpdated && (
            <Typography variant="body2">
              <strong>Last Updated:</strong> {new Date(state.loanStatus.lastUpdated).toLocaleString()}
            </Typography>
          )}
          {state.loanStatus.nextAction && (
            <Typography variant="body2">
              <strong>Next Action:</strong> {state.loanStatus.nextAction}
            </Typography>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default LoanStatusTracker;
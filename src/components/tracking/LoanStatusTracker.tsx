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

      const statusData = await fetchLoanStatus(loanId);
      
      // Get the status from the API response
      const loanStatus = statusData?.LoanStatus || state.loanStatus?.LoanStatus;
      if (loanStatus) {
        const previousStatus = currentStatus;
        setCurrentStatus(loanStatus);
        setLastUpdated(new Date());
        
        // Notify parent component of status change
        if (previousStatus && previousStatus !== loanStatus) {
          onStatusChange?.(loanStatus);
          push(`Loan status updated to: ${loanStatus}`, 'info');
        }
      } else {
        // If no status returned, show error
        setError('Loan not found or invalid Loan ID');
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
    if (!autoRefresh || !loanId) {
      return;
    }

    // Stop auto-refresh for closed/settled loans
    const normalizedStatus = currentStatus?.toUpperCase() || '';
    if (normalizedStatus.includes('CLOSED') || normalizedStatus.includes('SETTLED')) {
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
    const normalizedStatus = status?.toUpperCase() || '';
    if (normalizedStatus.includes('ACTIVE')) return 'success';
    if (normalizedStatus.includes('CLOSED') || normalizedStatus.includes('SETTLED')) return 'info';
    if (normalizedStatus.includes('OVERDUE') || normalizedStatus.includes('DEFAULT')) return 'error';
    if (normalizedStatus.includes('PENDING')) return 'warning';
    if (normalizedStatus.includes('APPROVED')) return 'success';
    if (normalizedStatus.includes('REJECTED') || normalizedStatus.includes('DECLINED')) return 'error';
    if (normalizedStatus.includes('DISBURSED')) return 'success';
    return 'default';
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

      {/* Status Information */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        {currentStatus ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Loan Status
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {currentStatus}
              </Typography>
            </Box>
            {state.loanStatus?.LoanDate && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Loan Date
                </Typography>
                <Typography variant="body1">
                  {state.loanStatus.LoanDate}
                </Typography>
              </Box>
            )}
            {state.loanStatus?.LoanId && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Loan ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {state.loanStatus.LoanId}
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Loading loan status...
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Footer Info */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {lastUpdated ? `Last updated: ${formatLastUpdated(lastUpdated)}` : 'Loading...'}
        </Typography>
        {autoRefresh && currentStatus && !currentStatus.toUpperCase().includes('CLOSED') && !currentStatus.toUpperCase().includes('SETTLED') && (
          <Typography variant="caption" color="text.secondary">
            Auto-refresh: {refreshInterval}s
          </Typography>
        )}
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default LoanStatusTracker;
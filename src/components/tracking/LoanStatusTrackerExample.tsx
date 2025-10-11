import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Alert,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import { LoanStatusTracker } from './LoanStatusTracker';

export const LoanStatusTrackerExample: React.FC = () => {
  const [loanId, setLoanId] = useState('');
  const [trackingLoanId, setTrackingLoanId] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [statusHistory, setStatusHistory] = useState<Array<{status: string, timestamp: Date}>>([]);

  const handleStartTracking = () => {
    if (loanId.trim()) {
      setTrackingLoanId(loanId.trim());
      setStatusHistory([]);
    }
  };

  const handleStopTracking = () => {
    setTrackingLoanId('');
    setStatusHistory([]);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusHistory(prev => [
      ...prev,
      { status: newStatus, timestamp: new Date() }
    ]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Loan Status Tracker Demo
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tracker Configuration
        </Typography>
        
        <Stack spacing={3}>
          <TextField
            label="Loan ID"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="Enter loan ID to track"
            fullWidth
            helperText="Enter a valid loan ID to start tracking its status"
          />
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Button 
              variant="contained" 
              onClick={handleStartTracking}
              disabled={!loanId.trim() || trackingLoanId === loanId.trim()}
            >
              Start Tracking
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleStopTracking}
              disabled={!trackingLoanId}
            >
              Stop Tracking
            </Button>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto-refresh enabled"
          />

          <Box>
            <Typography gutterBottom>
              Refresh Interval: {refreshInterval} seconds
            </Typography>
            <Slider
              value={refreshInterval}
              onChange={(_, value) => setRefreshInterval(value as number)}
              min={10}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              disabled={!autoRefresh}
            />
          </Box>
        </Stack>
      </Paper>

      {trackingLoanId && (
        <Box sx={{ mb: 3 }}>
          <LoanStatusTracker
            loanId={trackingLoanId}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            onStatusChange={handleStatusChange}
          />
        </Box>
      )}

      {statusHistory.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Status Change History
          </Typography>
          <Stack spacing={1}>
            {statusHistory.map((entry, index) => (
              <Alert key={index} severity="info" variant="outlined">
                <Typography variant="body2">
                  <strong>{entry.status}</strong> - {entry.timestamp.toLocaleString()}
                </Typography>
              </Alert>
            ))}
          </Stack>
        </Paper>
      )}

      {!trackingLoanId && (
        <Alert severity="info">
          Enter a loan ID and click "Start Tracking" to begin monitoring loan status.
          The tracker will automatically refresh every {refreshInterval} seconds when auto-refresh is enabled.
        </Alert>
      )}
    </Box>
  );
};

export default LoanStatusTrackerExample;
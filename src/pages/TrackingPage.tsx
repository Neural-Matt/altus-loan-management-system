import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { AppLayout } from '../components/layout/AppLayout';
import { LoanStatusTracker } from '../components/tracking/LoanStatusTracker';
import { getTracked, removeTracked, clearTracked, type TrackedRefEntry } from '../utils/recentTracking';

export const TrackingPage: React.FC = () => {
  const [reference, setReference] = useState('');
  const [trackedLoanId, setTrackedLoanId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [tracked, setTracked] = useState<TrackedRefEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load tracked items on mount
  useEffect(() => {
    setTracked(getTracked());
  }, []);

  const handleSearch = () => {
    const trimmedRef = reference.trim();
    if (!trimmedRef) {
      setError('Please enter a loan reference');
      return;
    }
    setError('');
    setTrackedLoanId(trimmedRef);
  };

  const handleClear = () => {
    setTrackedLoanId(null);
    setReference('');
    setError('');
  };

  const handleStatusChange = (status: string) => {
    // Refresh tracked items when status changes
    setTracked(getTracked());
  };

  const removeOne = (ref: string) => {
    removeTracked(ref);
    setTracked(getTracked());
  };

  const clearAll = () => {
    clearTracked();
    setTracked([]);
  };

  const handleTrackFromHistory = (ref: string) => {
    setReference(ref);
    setTrackedLoanId(ref);
  };

  const filteredTracked = tracked.filter(t => 
    !searchTerm || 
    t.ref.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'approved': return 'success';
      case 'disbursed': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'review': 
      case 'document_review': return 'primary';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <Typography variant="h4" gutterBottom>Unified Loan Tracker</Typography>
      
      {/* Search Section */}
      <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            label="Loan / Request Reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            fullWidth
            placeholder="Enter Loan ID or Request ID"
            size="small"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              startIcon={<SearchIcon />} 
              disabled={!reference.trim()} 
              onClick={handleSearch}
            >
              Search
            </Button>
            {trackedLoanId && (
              <Button 
                variant="text" 
                color="inherit" 
                startIcon={<CloseIcon />} 
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loan Status Tracker */}
      {trackedLoanId && (
        <Box sx={{ mb: 3 }}>
          <LoanStatusTracker 
            loanId={trackedLoanId}
            autoRefresh={true}
            refreshInterval={30}
            onStatusChange={handleStatusChange}
          />
        </Box>
      )}

      {/* Recent Tracking History */}
      {tracked.length > 0 && (
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Tracking History ({tracked.length})
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<ClearIcon />}
                onClick={clearAll}
              >
                Clear All
              </Button>
            </Stack>

            <TextField
              placeholder="Search by reference or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />

            <List>
              {filteredTracked.map((entry, idx) => (
                <ListItem key={`${entry.ref}-${idx}`} divider={idx < filteredTracked.length - 1}>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" fontWeight={500}>
                          {entry.ref}
                        </Typography>
                        {entry.status && (
                          <Chip
                            label={entry.status}
                            size="small"
                            color={getStatusColor(entry.status)}
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {new Date(entry.lastUpdated).toLocaleString()}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleTrackFromHistory(entry.ref)}
                      >
                        Track
                      </Button>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeOne(entry.ref)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
};
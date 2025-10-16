import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Collapse,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { getTokenStatus, updateBearerToken } from '../../api/altusApi';

interface EndpointStatus {
  name: string;
  url: string;
  port: number;
  status: 'connected' | 'disconnected' | 'testing' | 'unknown';
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
  details?: any;
}

interface ApiConnectivityStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'unknown';
  authentication: {
    hasToken: boolean;
    isValid: boolean;
    tokenPreview?: string;
  };
  endpoints: EndpointStatus[];
  lastFullCheck?: Date;
  totalResponseTime?: number;
}

export const ApiConnectivityChecker: React.FC = () => {
  const [status, setStatus] = useState<ApiConnectivityStatus>({
    overall: 'unknown',
    authentication: { hasToken: false, isValid: false },
    endpoints: [
      {
        name: 'Primary Services',
        url: 'http://3.6.174.212:5010',
        port: 5010,
        status: 'unknown'
      },
      {
        name: 'Customer Services',
        url: 'http://3.6.174.212:5011',
        port: 5011,
        status: 'unknown'
      },
      {
        name: 'Product Services',
        url: 'http://3.6.174.212:5012',
        port: 5012,
        status: 'unknown'
      }
    ]
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  // Test individual endpoint
  const testEndpoint = useCallback(async (endpoint: EndpointStatus): Promise<EndpointStatus> => {
    const startTime = Date.now();
    
    try {
      // Try health check first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${endpoint.url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          ...endpoint,
          status: 'connected',
          responseTime,
          lastChecked: new Date(),
          error: undefined
        };
      } else {
        return {
          ...endpoint,
          status: 'disconnected',
          responseTime,
          lastChecked: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        return {
          ...endpoint,
          status: 'disconnected',
          responseTime,
          lastChecked: new Date(),
          error: 'Request timeout (5s)'
        };
      }
      
      return {
        ...endpoint,
        status: 'disconnected',
        responseTime,
        lastChecked: new Date(),
        error: error.message || 'Connection failed'
      };
    }
  }, []);

  // Test all endpoints
  const runConnectivityTests = useCallback(async () => {
    setIsTesting(true);
    
    // Update authentication status
    const authStatus = getTokenStatus();
    
    // Set all endpoints to testing
    setStatus(prev => ({
      ...prev,
      authentication: authStatus,
      endpoints: prev.endpoints.map(ep => ({ ...ep, status: 'testing' as const }))
    }));

    try {
      // Test all endpoints in parallel
      const testPromises = status.endpoints.map(endpoint => testEndpoint(endpoint));
      const results = await Promise.all(testPromises);
      
      // Calculate overall status
      const connectedCount = results.filter(r => r.status === 'connected').length;
      const totalCount = results.length;
      
      let overall: ApiConnectivityStatus['overall'] = 'unknown';
      if (connectedCount === totalCount && authStatus.hasToken && authStatus.isValid) {
        overall = 'healthy';
      } else if (connectedCount > 0 && authStatus.hasToken) {
        overall = 'degraded';
      } else {
        overall = 'critical';
      }

      // Calculate total response time
      const totalResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0);

      setStatus({
        overall,
        authentication: authStatus,
        endpoints: results,
        lastFullCheck: new Date(),
        totalResponseTime
      });

    } catch (error) {
      console.error('Connectivity test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [status.endpoints, testEndpoint]);

  // Auto-run on mount
  useEffect(() => {
    runConnectivityTests();
  }, [runConnectivityTests]);

  // Handle token update
  const handleTokenUpdate = useCallback(() => {
    if (tokenInput.trim()) {
      updateBearerToken(tokenInput.trim());
      setTokenInput('');
      setShowTokenInput(false);
      runConnectivityTests();
    }
  }, [tokenInput, runConnectivityTests]);

  // Get status color and icon
  const getStatusDisplay = (endpointStatus: EndpointStatus['status']) => {
    switch (endpointStatus) {
      case 'connected':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Connected' };
      case 'disconnected':
        return { color: 'error', icon: <ErrorIcon />, label: 'Disconnected' };
      case 'testing':
        return { color: 'info', icon: <SpeedIcon />, label: 'Testing...' };
      default:
        return { color: 'default', icon: <InfoIcon />, label: 'Unknown' };
    }
  };

  const getOverallStatusDisplay = (overall: ApiConnectivityStatus['overall']) => {
    switch (overall) {
      case 'healthy':
        return { color: 'success', icon: <WifiIcon />, message: 'All systems operational' };
      case 'degraded':
        return { color: 'warning', icon: <WarningIcon />, message: 'Some services unavailable' };
      case 'critical':
        return { color: 'error', icon: <WifiOffIcon />, message: 'Major connectivity issues' };
      default:
        return { color: 'info', icon: <InfoIcon />, message: 'Status unknown' };
    }
  };

  const overallDisplay = getOverallStatusDisplay(status.overall);

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        {overallDisplay.icon}
        <Typography variant="subtitle1" fontWeight="bold">
          API Connectivity Status
        </Typography>
        <Chip 
          label={status.overall.toUpperCase()} 
          color={overallDisplay.color as any}
          size="small"
        />
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Refresh all endpoints">
          <IconButton 
            onClick={runConnectivityTests} 
            disabled={isTesting}
            size="small"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <IconButton 
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
          sx={{ 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Stack>

      {/* Quick Status */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {overallDisplay.message}
        {status.lastFullCheck && (
          <> • Last checked: {status.lastFullCheck.toLocaleTimeString()}</>
        )}
      </Typography>

      {/* Progress bar when testing */}
      {isTesting && <LinearProgress sx={{ mb: 2 }} />}

      {/* Compact endpoint status */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {status.endpoints.map((endpoint, index) => {
          const display = getStatusDisplay(endpoint.status);
          return (
            <Tooltip 
              key={index}
              title={`${endpoint.name} (${endpoint.port}): ${display.label}${endpoint.responseTime ? ` - ${endpoint.responseTime}ms` : ''}`}
            >
              <Chip
                icon={display.icon}
                label={`Port ${endpoint.port}`}
                color={display.color as any}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          );
        })}
      </Stack>

      {/* Expanded Details */}
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Authentication Status */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <SecurityIcon color={status.authentication.isValid ? 'success' : 'error'} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Authentication
                </Typography>
                <Chip 
                  label={status.authentication.isValid ? 'Valid Token' : 'Invalid/Missing Token'} 
                  color={status.authentication.isValid ? 'success' : 'error'}
                  size="small"
                />
              </Stack>
              
              {status.authentication.tokenPreview && (
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  Token: {status.authentication.tokenPreview}
                </Typography>
              )}

              {!status.authentication.isValid && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => setShowTokenInput(!showTokenInput)}
                  >
                    Update Token
                  </Button>
                </Stack>
              )}

              <Collapse in={showTokenInput}>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <input 
                    type="text"
                    placeholder="Enter UAT Bearer Token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  />
                  <Button size="small" onClick={handleTokenUpdate} variant="contained">
                    Update
                  </Button>
                </Stack>
              </Collapse>
            </CardContent>
          </Card>

          {/* Detailed Endpoint Status */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            {status.endpoints.map((endpoint, index) => {
              const display = getStatusDisplay(endpoint.status);
              return (
                <Box key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        {display.icon}
                        <Typography variant="subtitle2" fontWeight="bold">
                          {endpoint.name}
                        </Typography>
                      </Stack>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {endpoint.url}
                      </Typography>
                      
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip 
                          label={display.label} 
                          color={display.color as any}
                          size="small"
                        />
                        {endpoint.responseTime && (
                          <Chip 
                            label={`${endpoint.responseTime}ms`} 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      
                      {endpoint.error && (
                        <Alert severity="error" sx={{ mt: 1, fontSize: '12px' }}>
                          {endpoint.error}
                        </Alert>
                      )}
                      
                      {endpoint.lastChecked && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Last checked: {endpoint.lastChecked.toLocaleTimeString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {/* Overall Statistics */}
          {status.totalResponseTime && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Performance:</strong> Total response time: {status.totalResponseTime}ms • 
                Average: {Math.round(status.totalResponseTime / status.endpoints.length)}ms per endpoint
              </Typography>
            </Alert>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ApiConnectivityChecker;
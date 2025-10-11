import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface SnackbarMessage {
  id: number;
  text: string;
  severity: AlertColor;
}

interface SnackbarContextValue {
  push: (text: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
};

let counter = 0;

export const SnackbarProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [queue, setQueue] = useState<SnackbarMessage[]>([]);
  const [active, setActive] = useState<SnackbarMessage | null>(null);

  const processQueue = useCallback(() => {
    if (active || queue.length === 0) return;
    setActive(queue[0]);
    setQueue(q => q.slice(1));
  }, [active, queue]);

  const push = useCallback((text: string, severity: AlertColor = 'info') => {
    setQueue(q => [...q, { id: ++counter, text, severity }]);
  }, []);

  const handleClose = () => {
    setActive(null);
  };

  React.useEffect(() => { processQueue(); }, [processQueue, active]);

  return (
    <SnackbarContext.Provider value={{ push }}>
      {children}
      <Snackbar
        key={active?.id}
        open={!!active}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={active?.severity || 'info'} variant="filled" sx={{ width: '100%' }}>
          {active?.text}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from '../theme/theme';
import { LandingPage } from '../pages/LandingPage';
import { WizardPage } from '../pages/WizardPage';
import { TrackingPage } from '../pages/TrackingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import ApiTestPage from '../pages/ApiTestPage';
import { SnackbarProvider } from './feedback/SnackbarProvider';
import { AltusProvider } from '../context';
import APITesterComponent from './APITesterComponent';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AltusProvider>
        <BrowserRouter>
          <SnackbarProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/apply/:category/:product" element={<WizardPage />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/api-test" element={<APITesterComponent />} />
              <Route path="/test-apis" element={<ApiTestPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SnackbarProvider>
        </BrowserRouter>
      </AltusProvider>
    </ThemeProvider>
  );
};

export default App;
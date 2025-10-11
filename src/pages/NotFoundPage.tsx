import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Typography } from '@mui/material';

export const NotFoundPage: React.FC = () => {
  return (
    <AppLayout>
      <Typography variant="h5">Page Not Found</Typography>
    </AppLayout>
  );
};

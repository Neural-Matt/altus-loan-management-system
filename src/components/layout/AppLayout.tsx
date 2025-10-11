import React from 'react';
import { Container, Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps { children: React.ReactNode; }

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Header />
      <Container maxWidth="lg" sx={{ flexGrow:1, pt:2, pb:8 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

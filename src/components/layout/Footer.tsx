import React from 'react';
import { Box, Container, Typography, Stack, Link as MLink, Divider, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

export const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ mt:'auto', background:'#011A41', color:'#FFFFFF', pt:8, pb:4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display:'grid', gap:6, gridTemplateColumns:{ xs:'1fr', md:'2fr 1fr 1fr 2fr' } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight:700, mb:2 }}>Altus Financial</Typography>
            <Typography variant="body2" sx={{ opacity:0.85, mb:2 }}>Delivering accessible, transparent and responsible credit solutions with technology‑driven efficiency.</Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" aria-label="Facebook" sx={{ bgcolor:'rgba(255,255,255,0.08)', color:'#fff' }}><FacebookIcon fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="Twitter" sx={{ bgcolor:'rgba(255,255,255,0.08)', color:'#fff' }}><TwitterIcon fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="LinkedIn" sx={{ bgcolor:'rgba(255,255,255,0.08)', color:'#fff' }}><LinkedInIcon fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="Email" sx={{ bgcolor:'rgba(255,255,255,0.08)', color:'#fff' }}><EmailIcon fontSize="small" /></IconButton>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1.2 }}>Company</Typography>
            <Stack spacing={0.7}>
              <MLink href="https://altusfinancialservices.com/about.html" target="_blank" rel="noopener" underline="none" sx={{ color:'#FFFFFF', opacity:0.85, fontSize:13, '&:hover':{ opacity:1 } }}>About Us</MLink>
              <MLink href="#" underline="none" sx={{ color:'#FFFFFF', opacity:0.85, fontSize:13, '&:hover':{ opacity:1 } }}>Careers</MLink>
              <MLink href="#" underline="none" sx={{ color:'#FFFFFF', opacity:0.85, fontSize:13, '&:hover':{ opacity:1 } }}>News</MLink>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1.2 }}>Products</Typography>
            <Stack spacing={0.7}>
              <MLink href="#loan-categories" underline="none" sx={{ color:'#FFFFFF', opacity:0.85, fontSize:13, '&:hover':{ opacity:1 } }}>Personal Loans</MLink>
              <MLink href="#loan-categories" underline="none" sx={{ color:'#FFFFFF', opacity:0.85, fontSize:13, '&:hover':{ opacity:1 } }}>Payroll Loans</MLink>
              <MLink href="#loan-categories" underline="none" sx={{ color:'#FFFFFF', opacity:0.85, fontSize:13, '&:hover':{ opacity:1 } }}>Programmes</MLink>
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1.2 }}>Contact</Typography>
            <Stack spacing={0.7}>
              <Typography variant="body2" sx={{ opacity:0.85 }}>Mon - Fri: 8:00 AM - 5:00 PM</Typography>
              <Typography variant="body2" sx={{ opacity:0.85 }}>Email: info@altus.co.zm</Typography>
              <Typography variant="body2" sx={{ opacity:0.85 }}>Phone: +260 (000) 000 000</Typography>
            </Stack>
          </Box>
        </Box>
        <Divider sx={{ my:4, borderColor:'rgba(255,255,255,0.12)' }} />
        <Stack direction={{ xs:'column', md:'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.75)' }}>© {new Date().getFullYear()} Altus Financial Services. All rights reserved.</Typography>
          <Stack direction="row" spacing={3}>
            <MLink href="#" underline="none" sx={{ color:'rgba(255,255,255,0.75)', fontSize:12, '&:hover':{ color:'#FFFFFF' } }}>Privacy</MLink>
            <MLink href="#" underline="none" sx={{ color:'rgba(255,255,255,0.75)', fontSize:12, '&:hover':{ color:'#FFFFFF' } }}>Terms</MLink>
            <MLink href="#" underline="none" sx={{ color:'rgba(255,255,255,0.75)', fontSize:12, '&:hover':{ color:'#FFFFFF' } }}>Cookies</MLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

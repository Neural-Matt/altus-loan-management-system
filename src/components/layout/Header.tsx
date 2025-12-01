import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, Button, Link as MLink, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

// Logo component with multiple fallbacks for reliability
const AltusLogo: React.FC<{ height?: number; elevated?: boolean }> = ({ height = 48, elevated = false }) => {
  const [currentSrc, setCurrentSrc] = useState(0);
  const [showTextFallback, setShowTextFallback] = useState(false);
  
  // Logo sources in order of preference
  const logoSources = [
    '/altus-logo.png', // Local PNG logo (primary - actual Altus logo)
    'https://altusfinancialservices.com/assets/img/logo.png', // External logo (fallback)
  ];

  const handleImageError = () => {
    if (currentSrc < logoSources.length - 1) {
      // Try next logo source
      setCurrentSrc(currentSrc + 1);
    } else {
      // All image sources failed, show text fallback
      setShowTextFallback(true);
    }
  };

  // Reset to first source when elevated state changes (component refresh)
  useEffect(() => {
    setCurrentSrc(0);
    setShowTextFallback(false);
  }, []);

  if (showTextFallback) {
    // Text logo fallback - always works
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: height * 0.8,
            height: height * 0.8,
            borderRadius: '50%',
            background: elevated ? '#73B62B' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid',
            borderColor: elevated ? '#FFFFFF' : '#73B62B',
          }}
        >
          <Typography
            sx={{
              fontSize: height * 0.3,
              fontWeight: 900,
              color: elevated ? '#FFFFFF' : '#73B62B',
              lineHeight: 1,
            }}
          >
            A
          </Typography>
        </Box>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 800,
            fontSize: height * 0.33,
            color: elevated ? '#73B62B' : '#FFFFFF',
            letterSpacing: -0.5,
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          ALTUS
        </Typography>
      </Box>
    );
  }

  return (
    <img 
      src={logoSources[currentSrc]} 
      alt="Altus Financial Services" 
      style={{ 
        height, 
        objectFit: 'contain'
      }}
      onError={handleImageError}
    />
  );
};

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: 'https://altusfinancialservices.com/index.html', external: true },
  { label: 'About', href: 'https://altusfinancialservices.com/about.html', external: true },
  { label: 'Contact Us', href: 'https://altusfinancialservices.com/contact.html', external: true },
  { label: 'Track Application', href: '/track' },
  { label: '🧪 API Tester', href: '/api-test', highlight: true }
];

export const Header: React.FC = () => {
  const location = useLocation();
  // const location = useLocation(); // currently unused because all menu items are external
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // const isAppHome = location.pathname === '/'; // reserved for future highlighting of internal pages

  return (
  <Box sx={{ mb: 0 }}>
      <AppBar position="fixed" elevation={elevated ? 4 : 0} sx={{
        bgcolor: elevated ? '#F0F1F5' : '#73B62B',
        color: elevated ? '#73B62B' : '#FFFFFF',
        transition:'background-color .35s, color .35s',
        boxShadow: elevated ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        borderBottom: elevated ? '1px solid #e2e8f0' : 'none'
      }}>
        <Toolbar sx={{ display:'flex', gap:4, minHeight:72, position:'relative' }}>
          <Box component={Link} to="/" sx={{ display:'flex', alignItems:'center' }}>
            <AltusLogo height={48} elevated={elevated} />
          </Box>
          <Box sx={{
            position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)',
            display:'flex', alignItems:'center', gap:3
          }}>
            {navItems.map(item => {
              const active = !item.external && location.pathname === item.href;
              const baseStyles = {
                fontSize:14,
                fontWeight:600,
                textDecoration:'none',
                color: elevated ? '#073360' : '#FFFFFF',
                position:'relative',
                transition:'color .25s',
                '&:after': active ? { content:'""', position:'absolute', left:0, bottom:-6, height:3, width:'100%', bgcolor:'#011A41', borderRadius:2 } : {},
                '&:hover': { color: elevated ? '#011A41' : '#FFFFFF' }
              } as const;
              return item.external ? (
                <MLink key={item.label} href={item.href} target="_blank" rel="noopener" sx={baseStyles}>{item.label}</MLink>
              ) : (
                <MLink key={item.label} component={Link} to={item.href} sx={baseStyles}>{item.label}</MLink>
              );
            })}
          </Box>
          <Box sx={{ display:'flex', alignItems:'center', gap:1.2, marginLeft:'auto' }}>
            <Button component={Link} to="/"
              sx={{
                position:'relative',
                fontWeight:700,
                px:3.4,
                py:1.1,
                borderRadius:999,
                fontSize:14,
                letterSpacing:.5,
                color:'#FFFFFF',
                background: 'linear-gradient(135deg,#011A41 0%, #073360 45%, #0C5494 100%)',
                boxShadow:'0 4px 18px -2px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)',
                overflow:'hidden',
                transition:'transform .25s, box-shadow .25s',
                '&:before':{
                  content:'""', position:'absolute', inset:0, borderRadius:999,
                  background:'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0))', opacity:.4
                },
                '&:hover': { transform:'translateY(-2px)', boxShadow:'0 8px 28px -4px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.25)' },
                '&:active': { transform:'translateY(0)', boxShadow:'0 4px 16px -2px rgba(0,0,0,0.35)' },
                '&:focus-visible': { outline:'3px solid #FFFFFF', outlineOffset:2 }
              }}
            >Apply Now</Button>
            <IconButton component={Link} to="/track" aria-label="Track Application" sx={{
              position:'relative',
              width:44, height:44,
              borderRadius:'50%',
              color: elevated ? '#073360' : '#FFFFFF',
              background: elevated ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.15)',
              backdropFilter:'blur(4px)',
              boxShadow: elevated ? '0 2px 6px rgba(0,0,0,0.15)' : '0 4px 14px rgba(0,0,0,0.35)',
              transition:'background .3s, transform .25s, box-shadow .25s',
              '&:hover': { background: elevated ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)', transform:'translateY(-2px)' },
              '&:active': { transform:'translateY(0)', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' },
              '&:focus-visible': { outline:'2px solid #FFFFFF', outlineOffset:2 }
            }}>
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

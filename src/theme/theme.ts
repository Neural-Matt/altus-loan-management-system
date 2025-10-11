import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#0C2340' }, // navy
    secondary: { main: '#FFD200' },
  success: { main: '#73B62B' }, // updated green
    background: { default: '#F0F1F5', paper: '#FFFFFF' },
    text: { primary: '#333333' }
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.6rem', fontWeight: 600 },
    h3: { fontSize: '1.3rem', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 600
        }
      }
    }
  }
});

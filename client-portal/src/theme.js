// src/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2E4C1E', dark: '#253d17', contrastText: '#ffffff' },
    background: { default: '#E6E6E6', paper: '#ffffff' },
    text: { primary: '#333333' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
});

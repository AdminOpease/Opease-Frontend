import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'
 import AppLayout from './layouts/AppLayout'
 import Home from './pages/Home'
 import Onboarding from './pages/recruitment/Onboarding'
 import Login from './pages/Login'
 import './index.css'



const theme = createTheme({
  palette: {
    primary:   { main: '#2E4C1E', contrastText: '#FFFFFF' },
    background:{ default: '#E6E6E6', paper: '#FFFFFF' },
    text:      { primary: '#333333', secondary: '#333333' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: `'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, Helvetica, sans-serif`,
    body1: { lineHeight: 1.6, fontFamily: 'Arial, Helvetica, sans-serif' },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#E6E6E6', color: '#333333' } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          padding: 24,
          borderRadius: 14,
          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 9999, fontWeight: 600 } },
    },
  },
});




ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<ThemeProvider theme={theme}>
<CssBaseline />
<BrowserRouter>
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<AppLayout />}>
  <Route index element={<Navigate to="home" replace />} />
  <Route path="home" element={<Home />} />
  <Route path="recruitment/onboarding" element={<Onboarding />} />
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
</BrowserRouter>
</ThemeProvider>
</React.StrictMode>
)
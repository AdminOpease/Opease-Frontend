// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'

import AppLayout from './layouts/AppLayout'
import Onboarding from './pages/Recruitment/Onboarding'
import './index.css'
import RecruitmentDashboard from './pages/Recruitment/Dashboard'
import Removed from './pages/Recruitment/Removed'

import AdminDashboard from './pages/Admin/Dashboard.jsx'
import AdminDrivers from './pages/Admin/Drivers.jsx'
import AdminWorkingHours from './pages/Admin/WorkingHours.jsx'
import AdminStations from './pages/Admin/Stations.jsx'
import AdminExpiringDocs from './pages/Admin/ExpiringDocs.jsx'

import DriverDetailLayout from './pages/Admin/DriverDetail/DriverDetail.jsx'
import DriverProfile from './pages/Admin/DriverDetail/Profile.jsx'
import DriverDocuments from './pages/Admin/DriverDetail/Documents.jsx'

// NEW: Onboarding sub-pages
import OnboardingPhase1 from './pages/Recruitment/OnboardingPhase1.jsx'
import OnboardingPhase2 from './pages/Recruitment/OnboardingPhase2.jsx'

// shared in-memory store
import { AppStoreProvider } from './state/AppStore.jsx'

// compact MUI overrides
import baseTheme from './theme/muiTheme.js'

// Brand theme merged with compact table/menu overrides
const theme = createTheme(
  baseTheme,
  {
    palette: {
      primary:   { main: '#2E4C1E', contrastText: '#FFFFFF' },
      background:{ default: '#E6E6E6', paper: '#FFFFFF' }, // solid bg + white cards
      text:      { primary: '#333333', secondary: '#333333' },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: `'Arial Rounded MT Bold', 'Arial Rounded MT', Arial, Helvetica, sans-serif`,
      body1: { lineHeight: 1.6, fontFamily: 'Arial, Helvetica, sans-serif' },
      h6: { fontWeight: 700 },
    },
    components: {
      ...baseTheme.components,
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: '#E6E6E6', color: '#333333' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            boxShadow: 'none',
            padding: 0,
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { textTransform: 'none', borderRadius: 9999, fontWeight: 600 } },
      },
    },
  },
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            {/* App shell */}
            <Route path="/" element={<AppLayout />}>
              {/* Default start — no Home/Login */}
              <Route index element={<Navigate to="admin/dashboard" replace />} />

              {/* Recruitment */}
              <Route path="recruitment/onboarding" element={<Onboarding />}>
                <Route index element={<Navigate to="phase-1" replace />} />
                <Route path="phase-1" element={<OnboardingPhase1 />} />
                <Route path="phase-2" element={<OnboardingPhase2 />} />
              </Route>
              <Route path="recruitment/dashboard" element={<RecruitmentDashboard />} />
              <Route path="recruitment/removed" element={<Removed />} />

              {/* Admin */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/drivers" element={<AdminDrivers />} />
              <Route path="admin/working-hours" element={<AdminWorkingHours />} />
              <Route path="admin/stations" element={<AdminStations />} />
              <Route path="admin/expiring-docs" element={<AdminExpiringDocs />} />

              {/* Driver detail */}
              <Route path="admin/drivers/:email" element={<DriverDetailLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<DriverProfile />} />
                <Route path="documents" element={<DriverDocuments />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </ThemeProvider>
  </React.StrictMode>
)

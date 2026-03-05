// src/main.jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material'
import { createTheme } from '@mui/material/styles'

import AppLayout from './layouts/AppLayout'
import ErrorBoundary from './components/common/ErrorBoundary'
import './index.css'

// shared in-memory store
import { AppStoreProvider } from './state/AppStore.jsx'

// compact MUI overrides
import baseTheme from './theme/muiTheme.js'

// Lazy-loaded route components (code splitting)
const Onboarding = React.lazy(() => import('./pages/Recruitment/Onboarding'))
const OnboardingPhase1 = React.lazy(() => import('./pages/Recruitment/OnboardingPhase1.jsx'))
const OnboardingPhase2 = React.lazy(() => import('./pages/Recruitment/OnboardingPhase2.jsx'))
const RecruitmentDashboard = React.lazy(() => import('./pages/Recruitment/Dashboard'))
const Removed = React.lazy(() => import('./pages/Recruitment/Removed'))

const AdminDrivers = React.lazy(() => import('./pages/Admin/Drivers.jsx'))
const AdminWorkingHours = React.lazy(() => import('./pages/Admin/WorkingHours.jsx'))
const AdminStations = React.lazy(() => import('./pages/Admin/Stations.jsx'))
const AdminExpiringDocs = React.lazy(() => import('./pages/Admin/ExpiringDocs.jsx'))

const OpsRota = React.lazy(() => import('./pages/Operations/Rota.jsx'))
const OpsVans = React.lazy(() => import('./pages/Operations/Vans.jsx'))
const OpsPerformance = React.lazy(() => import('./pages/Operations/Performance.jsx'))
const OpsPlan = React.lazy(() => import('./pages/Operations/Plan.jsx'))

const DriverDetailLayout = React.lazy(() => import('./pages/Admin/DriverDetail/DriverDetail.jsx'))
const DriverProfile = React.lazy(() => import('./pages/Admin/DriverDetail/Profile.jsx'))
const DriverDocuments = React.lazy(() => import('./pages/Admin/DriverDetail/Documents.jsx'))

// Suspense fallback
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
    <CircularProgress size={28} />
  </Box>
)

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
      <ErrorBoundary>
        <AppStoreProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* App shell */}
                <Route path="/" element={<AppLayout />}>
                  {/* Default start — no Home/Login */}
                  <Route index element={<Navigate to="admin/drivers" replace />} />

                  {/* Recruitment */}
                  <Route path="recruitment/onboarding" element={<Onboarding />}>
                    <Route index element={<Navigate to="phase-1" replace />} />
                    <Route path="phase-1" element={<OnboardingPhase1 />} />
                    <Route path="phase-2" element={<OnboardingPhase2 />} />
                  </Route>
                  <Route path="recruitment/dashboard" element={<RecruitmentDashboard />} />
                  <Route path="recruitment/removed" element={<Removed />} />

                  {/* Admin */}
                  <Route path="admin/drivers" element={<AdminDrivers />} />
                  <Route path="admin/working-hours" element={<AdminWorkingHours />} />
                  <Route path="admin/stations" element={<AdminStations />} />
                  <Route path="admin/expiring-docs" element={<AdminExpiringDocs />} />

                  {/* Operations */}
                  <Route path="operations/rota" element={<OpsRota />} />
                  <Route path="operations/vans" element={<OpsVans />} />
                  <Route path="operations/performance" element={<OpsPerformance />} />
                  <Route path="operations/plan" element={<OpsPlan />} />

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
            </Suspense>
          </BrowserRouter>
        </AppStoreProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
)

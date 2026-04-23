// src/main.jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material'
import { createTheme } from '@mui/material/styles'

import AppLayout from './layouts/AppLayout'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

// shared in-memory store
import { AppStoreProvider } from './state/AppStore.jsx'

// compact MUI overrides
import baseTheme from './theme/muiTheme.js'

// Lazy-loaded route components
const Login = React.lazy(() => import('./pages/Login'))

const Onboarding = React.lazy(() => import('./pages/Recruitment/Onboarding'))
const OnboardingPhase1 = React.lazy(() => import('./pages/Recruitment/OnboardingPhase1.jsx'))
const OnboardingPhase2 = React.lazy(() => import('./pages/Recruitment/OnboardingPhase2.jsx'))
const RecruitmentDashboard = React.lazy(() => import('./pages/Recruitment/Dashboard'))
const Removed = React.lazy(() => import('./pages/Recruitment/Removed'))

const AdminDrivers = React.lazy(() => import('./pages/Admin/Drivers.jsx'))
const AdminWorkingHours = React.lazy(() => import('./pages/Admin/WorkingHours.jsx'))
const AdminStations = React.lazy(() => import('./pages/Admin/Stations.jsx'))
const AdminExpiringDocs = React.lazy(() => import('./pages/Admin/ExpiringDocs.jsx'))
const AdminChangeRequests = React.lazy(() => import('./pages/Admin/ChangeRequests.jsx'))

const OpsRota = React.lazy(() => import('./pages/Operations/Rota.jsx'))
const OpsVans = React.lazy(() => import('./pages/Operations/Vans.jsx'))
const OpsPerformance = React.lazy(() => import('./pages/Operations/Performance.jsx'))
const OpsPlan = React.lazy(() => import('./pages/Operations/Plan.jsx'))
const OpsPlanAM = React.lazy(() => import('./pages/Operations/PlanAM.jsx'))
const OpsPlanPM = React.lazy(() => import('./pages/Operations/PlanPM.jsx'))

const DriverDetailLayout = React.lazy(() => import('./pages/Admin/DriverDetail/DriverDetail.jsx'))
const DriverProfile = React.lazy(() => import('./pages/Admin/DriverDetail/Profile.jsx'))
const DriverDocuments = React.lazy(() => import('./pages/Admin/DriverDetail/Documents.jsx'))

const UserManagement = React.lazy(() => import('./pages/Settings/UserManagement.jsx'))

// Suspense fallback
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
    <CircularProgress size={28} />
  </Box>
)

// Helper to wrap routes with permission check
const P = ({ pageKey, children }) => (
  <ProtectedRoute pageKey={pageKey}>{children}</ProtectedRoute>
)

// Brand theme
const theme = createTheme(
  baseTheme,
  {
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
        <BrowserRouter>
          <AuthProvider>
            <AppStoreProvider>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Public login page */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected app shell */}
                  <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="operations/rota" replace />} />

                    {/* Recruitment */}
                    <Route path="recruitment/onboarding" element={<P pageKey="recruitment/onboarding"><Onboarding /></P>}>
                      <Route index element={<Navigate to="phase-1" replace />} />
                      <Route path="phase-1" element={<OnboardingPhase1 />} />
                      <Route path="phase-2" element={<OnboardingPhase2 />} />
                    </Route>
                    <Route path="recruitment/dashboard" element={<P pageKey="recruitment/dashboard"><RecruitmentDashboard /></P>} />
                    <Route path="recruitment/removed" element={<P pageKey="recruitment/removed"><Removed /></P>} />

                    {/* Admin */}
                    <Route path="admin/drivers" element={<P pageKey="admin/drivers"><AdminDrivers /></P>} />
                    <Route path="admin/change-requests" element={<P pageKey="admin/change-requests"><AdminChangeRequests /></P>} />
                    <Route path="admin/stations" element={<P pageKey="admin/stations"><AdminStations /></P>} />
                    <Route path="admin/expiring-docs" element={<P pageKey="admin/expiring-docs"><AdminExpiringDocs /></P>} />

                    {/* Operations */}
                    <Route path="operations/working-hours" element={<P pageKey="operations/working-hours"><AdminWorkingHours /></P>} />
                    <Route path="operations/rota" element={<P pageKey="operations/rota"><OpsRota /></P>} />
                    <Route path="operations/vans" element={<P pageKey="operations/vans"><OpsVans /></P>} />
                    <Route path="operations/performance" element={<P pageKey="operations/rota"><OpsPerformance /></P>} />
                    <Route path="operations/plan" element={<P pageKey="operations/plan"><OpsPlan /></P>}>
                      <Route index element={<Navigate to="am" replace />} />
                      <Route path="am" element={<OpsPlanAM />} />
                      <Route path="pm" element={<OpsPlanPM />} />
                    </Route>

                    {/* Driver detail (inherits admin/drivers permission) */}
                    <Route path="admin/drivers/:email" element={<P pageKey="admin/drivers"><DriverDetailLayout /></P>}>
                      <Route index element={<Navigate to="profile" replace />} />
                      <Route path="profile" element={<DriverProfile />} />
                      <Route path="documents" element={<DriverDocuments />} />
                    </Route>

                    {/* Settings (super admin) */}
                    <Route path="settings/users" element={<P pageKey="settings/users"><UserManagement /></P>} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AppStoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
)

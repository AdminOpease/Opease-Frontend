// src/App.jsx
import './App.css';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Onboarding pages
import Onboarding from './pages/Recruitment/Onboarding';
import OnboardingPhase1 from './pages/Recruitment/OnboardingPhase1';
import OnboardingPhase2 from './pages/Recruitment/OnboardingPhase2';

export default function App() {
  return (
    <>
      <div style={{ padding: 12 }}>
        <Link to="/recruitment/onboarding/phase-1">Go to Onboarding</Link>
      </div>

      <Routes>
        {/* Default landing → Phase 1 */}
        <Route path="/" element={<Navigate to="/recruitment/onboarding/phase-1" replace />} />

        {/* Onboarding with nested routes */}
        <Route path="/recruitment/onboarding" element={<Onboarding />}>
          <Route index element={<Navigate to="phase-1" replace />} />
          <Route path="phase-1" element={<OnboardingPhase1 />} />
          <Route path="phase-2" element={<OnboardingPhase2 />} />
        </Route>

        {/* Catch-all → Phase 1 */}
        <Route path="*" element={<Navigate to="/recruitment/onboarding/phase-1" replace />} />
      </Routes>
    </>
  );
}

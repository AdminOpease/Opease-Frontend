// src/state/AppStore.jsx
import * as React from 'react';

const DEPOTS = ['Heathrow', 'Greenwich', 'Battersea'];

const initialDrivers = [
  { email: 'amy@example.com',  name: 'Amy Jones',  phone: '+447700900111', status: 'Active',     depot: 'Heathrow' },
  { email: 'ben@example.com',  name: 'Ben Singh',  phone: '+447700900222', status: 'Onboarding', depot: 'Greenwich' },
  { email: 'cara@example.com', name: 'Cara Li',    phone: '+447700900333', status: 'Inactive',   depot: 'Heathrow' },
  { email: 'dan@example.com',  name: 'Dan Patel',  phone: '+447700900444', status: 'Offboarded', depot: 'Battersea' },
];

const initialDocs = [
  // type: 'Right to Work' | 'DVLA' | 'Licence'
  { id: 'd1', driverEmail: 'amy@example.com',  driverName: 'Amy Jones',  depot: 'Heathrow',  type: 'Licence', expiryDate: '2025-09-15', deletedAt: null, archivedAt: null },
  { id: 'd2', driverEmail: 'amy@example.com',  driverName: 'Amy Jones',  depot: 'Heathrow',  type: 'DVLA',    expiryDate: '2025-09-05', deletedAt: null, archivedAt: null },
  { id: 'd3', driverEmail: 'ben@example.com',  driverName: 'Ben Singh',  depot: 'Greenwich', type: 'Right to Work', expiryDate: '2025-10-01', deletedAt: null, archivedAt: null },
  { id: 'd4', driverEmail: 'dan@example.com',  driverName: 'Dan Patel',  depot: 'Battersea', type: 'Licence', expiryDate: '2026-02-10', deletedAt: null, archivedAt: null },
];

const AppStoreContext = React.createContext(null);

export function AppStoreProvider({ children }) {
  const [drivers, setDrivers] = React.useState(initialDrivers);
  const [documents, setDocuments] = React.useState(initialDocs);

  // --- Applications helpers ---
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const [applications, setApplications] = React.useState(() =>
    initialDrivers.map((d) => ({
      ...d,
      dateApplied: todayISO(),
      phone: d.phone || '+447700900111',
      preDCC: 'In Review',
      accountId: '',
      dlVerification: 'Pending',
      bgc: 'Pending',
      training: null,
      contractSigning: 'Pending',
      dcc: null,
      activatedAt: null,
      removedAt: null,
      removedComment: '',
    }))
  );

  const phaseOf = (app) => {
    if (
      app.bgc !== 'Pending' ||
      app.training ||
      app.contractSigning === 'Complete' ||
      app.dcc
    )
      return 2;
    return 1;
  };

  const activateDriver = (email) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.email === email ? { ...a, activatedAt: new Date().toISOString() } : a
      )
    );
  };

  const removeDriver = (email, comment = '') => {
    setApplications((prev) =>
      prev.map((a) =>
        a.email === email
          ? { ...a, removedAt: new Date().toISOString(), removedComment: comment }
          : a
      )
    );
  };

  const restoreDriver = (email) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.email === email ? { ...a, removedAt: null, removedComment: '' } : a
      )
    );
  };

  // NEW: generic updater so Phase 1 can "Proceed" to Phase 2 (and for any future patches)
  const updateApplication = (email, patch) => {
    setApplications((prev) =>
      prev.map((a) => (a.email === email ? { ...a, ...patch } : a))
    );
  };

  const metrics = {
    pendingContractSignings: () =>
      applications.filter(
        (a) => !a.removedAt && a.contractSigning !== 'Complete'
      ).length,
    targets: () => ({ weeklyTarget: 10, monthToDate: 0 }),
    startedPerWeek: () => {
      const out = {};
      for (const a of applications) {
        if (!a.activatedAt) continue;
        const d = new Date(a.activatedAt);
        const y = d.getFullYear();
        const firstJan = new Date(y, 0, 1);
        const pastDays = Math.floor((d - firstJan) / 86400000);
        const week = Math.ceil((pastDays + firstJan.getDay() + 1) / 7);
        const key = `${y}-W${String(week).padStart(2, '0')}`;
        out[key] = (out[key] || 0) + 1;
      }
      return out;
    },
    receivedToday: () =>
      applications.filter((a) => a.dateApplied === todayISO() && !a.removedAt)
        .length,
    phase1Count: () =>
      applications.filter((a) => !a.removedAt && phaseOf(a) === 1).length,
    phase2Count: () =>
      applications.filter((a) => !a.removedAt && phaseOf(a) === 2).length,
  };

  // IMPORTANT: include applications/metrics in the memo deps so consumers re-render on changes
  const value = React.useMemo(
    () => ({
      depots: DEPOTS,

      drivers,
      setDrivers,

      applications,
      setApplications,
      updateApplication, // ← exposed
      activateDriver,
      removeDriver,
      restoreDriver,
      metrics,

      documents,
      setDocuments,
    }),
    [drivers, documents, applications, metrics]
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = React.useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within <AppStoreProvider>');
  return ctx;
}

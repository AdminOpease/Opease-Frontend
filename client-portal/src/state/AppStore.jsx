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

  const value = React.useMemo(() => ({
    depots: DEPOTS,

    drivers,
    setDrivers,

    documents,
    setDocuments,
  }), [drivers, documents]);

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

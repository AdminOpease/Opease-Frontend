// client-portal/src/state/AppStore.jsx
import * as React from 'react';
import { drivers as driversApi, applications as appsApi, documents as docsApi, changeRequestsApi, stations as stationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AppStoreContext = React.createContext(null);

export function AppStoreProvider({ children }) {
  const { depots: allowedDepots, isSuperAdmin } = useAuth();
  const [drivers, setDrivers] = React.useState([]);
  const [documents, setDocuments] = React.useState([]);
  const [applications, setApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [changeRequests, setChangeRequests] = React.useState([]);
  const [depots, setDepots] = React.useState([]);

  // ── Fetch data from API on mount ──
  const fetchDrivers = React.useCallback(async () => {
    try {
      const res = await driversApi.list({ limit: 100 });
      setDrivers(
        (res.data || []).map((d) => ({
          id: d.id,
          email: d.email,
          name: `${d.first_name} ${d.last_name}`,
          first_name: d.first_name,
          last_name: d.last_name,
          phone: d.phone,
          status: d.status,
          depot: d.depot,
          amazon_id: d.amazon_id,
          transporter_id: d.transporter_id,
          portal_invited: !!d.portal_invited,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  }, []);

  const fetchApplications = React.useCallback(async () => {
    try {
      const res = await appsApi.list({ limit: 100 });
      setApplications(
        (res.data || []).map((a) => ({
          id: a.id,
          driver_id: a.driver_id,
          email: a.email,
          name: `${a.first_name} ${a.last_name}`,
          phone: a.phone,
          depot: a.depot,
          status: a.driver_status,
          amazon_id: a.amazon_id,
          dateApplied: a.date_applied,
          preDCC: a.pre_dcc || 'In Review',
          firMissingDocs: a.fir_missing_docs ? JSON.parse(a.fir_missing_docs) : [],
          accountId: a.account_id || '',
          flexConfirmed: !!a.flex_confirmed,
          dlConfirmed: !!a.dl_confirmed,
          dlVerification: a.dl_verification || 'Pending',
          bgc: a.bgc || 'Pending',
          training: a.training_date
            ? { date: a.training_date, company: a.training_company || '', session: a.training_session || '' }
            : null,
          contractSigning: a.contract_signing || 'Pending',
          drivingTestSlots: a.driving_test_slots ? JSON.parse(a.driving_test_slots) : [],
          drivingTestResult: a.driving_test_result || null,
          trainingSlots: a.training_slots ? JSON.parse(a.training_slots) : [],
          trainingMessage: a.training_message || '',
          trainingBooked: a.training_booked ? JSON.parse(a.training_booked) : null,
          trainingResult: a.training_result || null,
          dcc: a.dcc_date || null,
          activatedAt: a.activated_at,
          removedAt: a.removed_at,
          removedComment: a.removed_comment || '',
          updatedAt: a.updated_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  }, []);

  const fetchDocuments = React.useCallback(async () => {
    try {
      const res = await docsApi.list({ limit: 100 });
      setDocuments(
        (res.data || []).map((d) => ({
          id: d.id,
          driverEmail: d.driver_email,
          driverName: `${d.first_name} ${d.last_name}`,
          depot: d.depot,
          type: d.type,
          expiryDate: d.expiry_date,
          uploadedAt: d.uploaded_at,
          deletedAt: d.deleted_at,
          archivedAt: d.archived_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, []);

  const fetchStations = React.useCallback(async () => {
    try {
      const res = await stationsApi.list();
      const allDepots = (res.data || []).map((s) => s.code || s.name);
      // Filter by allowed depots (super admin sees all)
      if (isSuperAdmin || !allowedDepots || allowedDepots.length === 0) {
        setDepots(allDepots);
      } else {
        setDepots(allDepots.filter((d) => allowedDepots.includes(d)));
      }
    } catch (err) {
      console.error('Failed to fetch stations:', err);
    }
  }, []);

  const { isAuthenticated, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated || authLoading) { setLoading(false); return; }
    Promise.all([fetchDrivers(), fetchApplications(), fetchDocuments(), fetchStations()])
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, fetchDrivers, fetchApplications, fetchDocuments, fetchStations]);

  // Poll all data every 5s for near-instant updates across portals
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const refresh = () => { fetchDrivers(); fetchApplications(); fetchDocuments(); fetchStations(); };
    const id = setInterval(refresh, 5_000);
    return () => clearInterval(id);
  }, [fetchDrivers, fetchApplications, fetchDocuments, fetchStations]);

  // ── Change Requests ──
  const fetchChangeRequests = React.useCallback(async () => {
    try {
      const res = await changeRequestsApi.list({ limit: 200 });
      setChangeRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch change requests:', err);
    }
  }, []);

  const updateChangeRequest = React.useCallback(async (id, status) => {
    try {
      await changeRequestsApi.update(id, { status });
      // Backend auto-applies approved changes to driver profile
      await Promise.all([fetchChangeRequests(), fetchDrivers()]);
    } catch (err) {
      console.error('Failed to update change request:', err);
    }
  }, [fetchChangeRequests, fetchDrivers]);

  // ── Phase computation ──
  // An app is in Phase 2 once it has been Proceeded (bgc moved from its original 'Pending' default).
  // We detect Phase 2 by checking if any Phase 2-specific fields have been touched,
  // OR if Phase 1 is fully complete (pre_dcc Complete + dl_verification Pass).
  const phaseOf = (app) => {
    // Phase 1 complete = proceeded to Phase 2
    const phase1Done = app.preDCC === 'Complete' && app.dlVerification === 'Pass';
    // Any Phase 2 field touched
    const phase2Activity =
      (app.bgc && app.bgc !== 'Pending') ||
      app.drivingTestSlots?.length > 0 ||
      app.drivingTestResult ||
      app.training ||
      app.dcc;
    if (phase1Done || phase2Activity) {
      return 2;
    }
    return 1;
  };

  // ── Actions (call API then refetch) ──
  const updateApplication = async (emailOrId, patch) => {
    const app = applications.find((a) => a.email === emailOrId || a.id === emailOrId);
    if (!app) return;

    // Map frontend fields to backend column names
    const apiPatch = {};
    if (patch.preDCC !== undefined) apiPatch.pre_dcc = patch.preDCC;
    if (patch.firMissingDocs !== undefined) apiPatch.fir_missing_docs = JSON.stringify(patch.firMissingDocs);
    if (patch.accountId !== undefined) apiPatch.account_id = patch.accountId;
    if (patch.dlVerification !== undefined) apiPatch.dl_verification = patch.dlVerification;
    if (patch.bgc !== undefined) apiPatch.bgc = patch.bgc;
    if (patch.contractSigning !== undefined) apiPatch.contract_signing = patch.contractSigning;
    if (patch.drivingTestSlots !== undefined) apiPatch.driving_test_slots = JSON.stringify(patch.drivingTestSlots);
    if (patch.drivingTestResult !== undefined) apiPatch.driving_test_result = patch.drivingTestResult;
    if (patch.trainingSlots !== undefined) apiPatch.training_slots = JSON.stringify(patch.trainingSlots);
    if (patch.trainingMessage !== undefined) apiPatch.training_message = patch.trainingMessage;
    if (patch.trainingBooked !== undefined) apiPatch.training_booked = patch.trainingBooked ? JSON.stringify(patch.trainingBooked) : null;
    if (patch.trainingResult !== undefined) apiPatch.training_result = patch.trainingResult;
    if (patch.flexConfirmed !== undefined) apiPatch.flex_confirmed = patch.flexConfirmed ? 1 : 0;
    if (patch.dlConfirmed !== undefined) apiPatch.dl_confirmed = patch.dlConfirmed ? 1 : 0;
    if (patch.dcc !== undefined) apiPatch.dcc_date = patch.dcc;
    if (patch.training !== undefined) {
      if (patch.training) {
        apiPatch.training_date = patch.training.date;
        apiPatch.training_company = patch.training.company;
        apiPatch.training_session = patch.training.session;
      } else {
        apiPatch.training_date = null;
        apiPatch.training_company = null;
        apiPatch.training_session = null;
      }
    }

    try {
      await appsApi.update(app.id, apiPatch);
      // Optimistic local update
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, ...patch } : a))
      );
      // Backend syncs account_id → drivers.amazon_id, so refresh drivers list
      if (patch.accountId !== undefined) fetchDrivers();
    } catch (err) {
      console.error('Failed to update application:', err);
    }
  };

  const activateDriver = async (emailOrId) => {
    const app = applications.find((a) => a.email === emailOrId || a.id === emailOrId);
    if (!app) return;
    try {
      await appsApi.activate(app.id);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, activatedAt: new Date().toISOString() } : a))
      );
      fetchDrivers(); // Refresh driver status
    } catch (err) {
      console.error('Failed to activate:', err);
    }
  };

  const removeDriver = async (emailOrId, comment = '') => {
    const app = applications.find((a) => a.email === emailOrId || a.id === emailOrId);
    if (!app) return;
    try {
      await appsApi.remove(app.id, comment);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, removedAt: new Date().toISOString(), removedComment: comment }
            : a
        )
      );
      fetchDrivers();
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  const restoreDriver = async (emailOrId) => {
    const app = applications.find((a) => a.email === emailOrId || a.id === emailOrId);
    if (!app) return;
    try {
      await appsApi.update(app.id, { removed_at: null, removed_comment: null });
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, removedAt: null, removedComment: '' } : a))
      );
    } catch (err) {
      console.error('Failed to restore:', err);
    }
  };

  // ── Metrics ──
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const metrics = React.useMemo(
    () => ({
      pendingContractSignings: () =>
        applications.filter((a) => !a.removedAt && a.contractSigning !== 'Complete').length,
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
        applications.filter((a) => a.dateApplied === todayISO() && !a.removedAt).length,
      phase1Count: () =>
        applications.filter((a) => !a.removedAt && phaseOf(a) === 1).length,
      phase2Count: () =>
        applications.filter((a) => !a.removedAt && phaseOf(a) === 2).length,
    }),
    [applications]
  );

  const value = React.useMemo(
    () => ({
      depots,
      fetchStations,
      loading,

      drivers,
      setDrivers,
      fetchDrivers,

      applications,
      setApplications,
      updateApplication,
      activateDriver,
      removeDriver,
      restoreDriver,
      fetchApplications,
      metrics,

      documents,
      setDocuments,
      fetchDocuments,

      changeRequests,
      fetchChangeRequests,
      updateChangeRequest,
    }),
    [drivers, documents, applications, changeRequests, metrics, loading, depots]
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

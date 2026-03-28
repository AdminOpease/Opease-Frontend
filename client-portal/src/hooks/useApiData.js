import { useState, useEffect, useCallback } from 'react';
import { rota as rotaApi, planAm as planAmApi, planPm as planPmApi, vans as vansApi } from '../services/api';

/**
 * Fetch rota data from API and return it in the same format as the demo data.
 * Returns { weeks, drivers, schedule, loading }
 */
export function useRotaData() {
  const [weeks, setWeeks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [weeksRes] = await Promise.all([rotaApi.weeks()]);
        const apiWeeks = (weeksRes.data || []).map((w) => {
          const days = buildDaysFromWeek(w.start_date);
          return { weekNumber: w.week_number, startDate: w.start_date, endDate: w.end_date, days, id: w.id };
        });
        if (cancelled) return;
        setWeeks(apiWeeks);

        // Fetch schedule for all weeks
        const scheduleMap = {};
        const driverMap = {};
        for (const week of apiWeeks) {
          const res = await rotaApi.schedule({ weekId: week.id });
          for (const row of res.data || []) {
            const key = `${row.driver_id}-${week.weekNumber}`;
            scheduleMap[key] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d) => row[d] || '');
            if (!driverMap[row.driver_id]) {
              driverMap[row.driver_id] = {
                id: row.driver_id,
                name: `${row.first_name} ${row.last_name}`,
                amazonId: row.amazon_id || '',
                depot: row.depot,
                left: row.driver_status === 'Offboarded' ? 1 : 0,
              };
            }
          }
        }
        if (cancelled) return;
        setDrivers(Object.values(driverMap));
        setSchedule(scheduleMap);
      } catch (err) {
        console.error('Failed to load rota data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { weeks, drivers, schedule, loading };
}

/**
 * Fetch AM plan data from API for a given date and depot.
 */
export function usePlanAmData(date, depot) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const dateStr = formatISO(date);
      const params = { date: dateStr };
      if (depot && depot !== 'All Depots') params.depot = depot;
      const res = await planAmApi.list(params);
      const apiGroups = (res.data || []).map((g) => ({
        id: g.id,
        group: g.title,
        time: g.time,
        color: g.color,
        bg_color: g.bg_color,
        rows: (g.rows || []).map((r) => ({
          id: r.id,
          driver: `${r.first_name} ${r.last_name}`,
          tid: r.amazon_id || '',
          driver_id: r.driver_id,
          van: r.van || '',
          route: r.route || '',
          bay: r.bay || '',
          atlas: r.atlas || '',
        })),
      }));
      setGroups(apiGroups);
    } catch (err) {
      console.error('Failed to load AM plan:', err);
    } finally {
      setLoading(false);
    }
  }, [date, depot]);

  useEffect(() => { refresh(); }, [refresh]);

  return { groups, loading, refresh };
}

/**
 * Fetch PM plan data from API for a given date and depot.
 */
export function usePlanPmData(date, depot) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const dateStr = formatISO(date);
      const params = { date: dateStr };
      if (depot && depot !== 'All Depots') params.depot = depot;
      const res = await planPmApi.list(params);
      const apiSections = (res.data || []).map((s) => ({
        id: s.id,
        title: s.title,
        time: s.time,
        drivers: (s.drivers || []).map((d) => ({
          id: d.id,
          driver_id: d.driver_id,
          name: `${d.first_name} ${d.last_name}`,
          amazonId: d.amazon_id || '',
        })),
      }));
      setSections(apiSections);
    } catch (err) {
      console.error('Failed to load PM plan:', err);
    } finally {
      setLoading(false);
    }
  }, [date, depot]);

  useEffect(() => { refresh(); }, [refresh]);

  return { sections, loading, refresh };
}

/**
 * Fetch van fleet and assignments.
 */
export function useVanData(depot) {
  const [fleet, setFleet] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (depot && depot !== 'All Depots') params.station = depot;
      const [fleetRes, assignRes] = await Promise.all([
        vansApi.list(params),
        vansApi.assignments(params),
      ]);
      setFleet((fleetRes.data || []).map((v) => ({
        id: v.id,
        reg: v.registration,
        make: v.make,
        station: v.station,
        transmission: v.transmission,
      })));
      setAssignments(assignRes.data || []);
    } catch (err) {
      console.error('Failed to load van data:', err);
    } finally {
      setLoading(false);
    }
  }, [depot]);

  useEffect(() => { refresh(); }, [refresh]);

  return { fleet, setFleet, assignments, setAssignments, loading, refresh };
}

// ── Helpers ──

function buildDaysFromWeek(startDate) {
  const days = [];
  const s = new Date(startDate + 'T00:00:00');
  for (let d = 0; d < 7; d++) {
    const dt = new Date(s);
    dt.setDate(s.getDate() + d);
    days.push(formatISO(dt));
  }
  return days;
}

function formatISO(d) {
  if (typeof d === 'string') return d;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// src/pages/Operations/Vans.jsx
import * as React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Menu,
  MenuItem,
  Popover,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Select,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import * as XLSX from 'xlsx';
import { useAppStore } from '../../state/AppStore.jsx';
import { WORK_CODES } from '../../data/rotaDemoData';
import { vans as vansApi, rota as rotaApi } from '../../services/api';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Make color map ──────────────────────────────────────────────────
const MAKE_COLORS = {
  Ford:     { color: '#0D47A1', bg: '#E3F2FD' },
  Sprinter: { color: '#1B5E20', bg: '#E8F5E9' },
  Citroen:  { color: '#E65100', bg: '#FFF3E0' },
  Maxus:    { color: '#4A148C', bg: '#F3E5F5' },
  Peugeot:  { color: '#00695C', bg: '#E0F2F1' },
  Vivaro:   { color: '#B71C1C', bg: '#FFEBEE' },
};

const MAKE_OPTIONS = Object.keys(MAKE_COLORS);
const DEFAULT_MAKE_STYLE = { color: '#37474F', bg: '#ECEFF1' };

// ── Shared cell styling ─────────────────────────────────────────────
const cellSx = {
  fontSize: 11,
  px: 1,
  py: 0.5,
  borderRight: '1px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
};

const headCellSx = {
  ...cellSx,
  fontWeight: 700,
  bgcolor: '#F5F5F5',
  borderBottom: '2px solid',
  borderBottomColor: 'divider',
};

const stickyCellSx = (left, zExtra = 0) => ({
  position: 'sticky',
  left,
  zIndex: 2 + zExtra,
  bgcolor: 'inherit',
});

const stickyHeadSx = (left) => ({
  position: 'sticky',
  left,
  zIndex: 4,
});

function formatShortDate(iso) {
  const [, m, d] = iso.split('-');
  return `${parseInt(d)}/${parseInt(m)}`;
}

function toDateStr(d) { return d ? d.slice(0, 10) : ''; }

function formatWeekRange(week) {
  const s = new Date(week.startDate + 'T00:00:00');
  const e = new Date(week.endDate + 'T00:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}`;
}

// ── Pill button styles (matches Rota / Drivers) ─────────────────────
const ALL = 'All Depots';

const pillBtnSx = {
  borderRadius: 9999,
  px: 2,
  minHeight: 34,
  border: '1px solid',
  borderColor: 'rgba(46,76,30,0.35)',
  color: 'primary.main',
  '&:hover': { backgroundColor: 'rgba(46,76,30,0.06)' },
};

const menuPaperSx = {
  mt: 0.5,
  minWidth: 200,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
};
const menuListSx = { py: 0 };
const navLikeItemSx = {
  justifyContent: 'center',
  textAlign: 'center',
  px: 2,
  py: 0.9,
  fontSize: 14,
  lineHeight: 1.25,
  '&:hover': { backgroundColor: 'action.hover' },
};

const filterInputSx = {
  width: '100%',
  height: 20,
  border: '1px solid #D0D0D0',
  borderRadius: 3,
  textAlign: 'center',
  fontSize: 10,
  outline: 'none',
  padding: '0 4px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export default function Vans() {
  const { depots } = useAppStore();
  const depotOptions = [ALL, ...depots];
  const [depot, setDepot] = React.useState('DLU2');
  const [depotEl, setDepotEl] = React.useState(null);

  const [weekIdx, setWeekIdx] = React.useState(0);
  const [vanSchedule, setVanSchedule] = React.useState({});

  // ── Live rota data ──────────────────────────────────────────────
  const [ROTA_WEEKS, setRotaWeeks] = React.useState([]);
  const [liveDrivers, setLiveDrivers] = React.useState([]);
  const [liveShifts, setLiveShifts] = React.useState({});

  React.useEffect(() => {
    rotaApi.weeks().then((res) => {
      const weeks = (res.data || []).map((w) => {
        // Build days array (7 ISO dates from start_date) — use UTC to avoid DST shifts
        const days = [];
        const s = new Date(toDateStr(w.start_date) + 'T12:00:00Z');
        for (let d = 0; d < 7; d++) {
          const dt = new Date(s.getTime() + d * 86400000);
          days.push(dt.toISOString().slice(0, 10));
        }
        return {
          weekNumber: w.week_number,
          label: `Week ${w.week_number}`,
          id: w.id,
          startDate: toDateStr(w.start_date),
          endDate: toDateStr(w.end_date),
          days,
        };
      });
      setRotaWeeks(weeks);
      // Default to current week
      const today = new Date().toISOString().slice(0, 10);
      const curIdx = weeks.findIndex((w) => w.startDate <= today && w.endDate >= today);
      if (curIdx >= 0) setWeekIdx(curIdx);
    }).catch(console.error);
  }, []);

  // Fetch schedule for current week
  const week = ROTA_WEEKS[weekIdx];
  React.useEffect(() => {
    if (!week) return;
    const params = { weekId: week.id };
    if (depot !== ALL) params.depot = depot;
    rotaApi.schedule(params).then((res) => {
      const rows = res.data || [];
      const driverMap = new Map();
      const shifts = {};
      for (const r of rows) {
        if (!driverMap.has(r.driver_id)) {
          driverMap.set(r.driver_id, {
            id: r.driver_id,
            name: `${r.first_name} ${r.last_name}`,
            info: r.transporter_id || r.amazon_id || '',
            depot: r.depot,
          });
        }
        const key = `${r.driver_id}-${week.weekNumber}`;
        shifts[key] = [r.sun || '', r.mon || '', r.tue || '', r.wed || '', r.thu || '', r.fri || '', r.sat || ''];
      }
      setLiveDrivers([...driverMap.values()].sort((a, b) => a.name.localeCompare(b.name)));
      setLiveShifts(shifts);
    }).catch(console.error);
  }, [week?.id, depot]);

  // Use live data instead of demo
  const VAN_DRIVERS = liveDrivers;
  const VAN_DRIVER_SHIFTS = liveShifts;

  // ── Load van assignments from backend ────────────────────────────
  React.useEffect(() => {
    if (!week) return;
    const params = { startDate: week.days[0], endDate: week.days[6] };
    if (depot !== ALL) params.depot = depot;
    vansApi.assignments(params).then((res) => {
      const schedule = {};
      for (const a of (res.data || [])) {
        schedule[`${a.driver_id}-${a.assign_date}`] = a.registration;
      }
      setVanSchedule(schedule);
    }).catch(console.error);
  }, [week?.id, depot]);

  // ── Live fleet state ──────────────────────────────────────────────
  const [fleet, setFleet] = React.useState([]);
  const nextId = React.useRef(1);

  React.useEffect(() => {
    vansApi.list({ station: depot === ALL ? undefined : depot })
      .then((res) => {
        const apiFleet = (res.data || []).map((v) => ({
          id: v.id,
          reg: v.registration,
          make: v.make,
          station: v.station,
          transmission: v.transmission || 'Manual',
          doNotUse: v.do_not_use || false,
          reason: v.reason || '',
        }));
        setFleet(apiFleet);
        nextId.current = apiFleet.length + 1;
      })
      .catch((err) => console.error('Failed to fetch vans:', err));
  }, [depot]);

  // Derived lookup: reg → make (recomputed when fleet changes)
  const regToMake = React.useMemo(() => {
    const map = {};
    fleet.forEach((v) => { map[v.reg] = v.make; });
    return map;
  }, [fleet]);

  // ── Van chip (color-coded by make) ────────────────────────────────
  const VanChip = React.useCallback(({ code }) => {
    if (!code) return null;
    const make = regToMake[code];
    const style = MAKE_COLORS[make] || DEFAULT_MAKE_STYLE;
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          minWidth: 32,
          px: 0.75,
          py: 0.15,
          borderRadius: 1,
          fontWeight: 600,
          fontSize: 10,
          lineHeight: '18px',
          textAlign: 'center',
          bgcolor: style.bg,
          color: style.color,
          letterSpacing: 0.5,
        }}
      >
        {code}
      </Box>
    );
  }, [regToMake]);

  // Column filters
  const [nameFilter, setNameFilter] = React.useState('');
  const [infoFilter, setInfoFilter] = React.useState('');
  const [dayFilters, setDayFilters] = React.useState(Array(7).fill(''));

  // Van picker popover state
  const [pickerAnchor, setPickerAnchor] = React.useState(null);
  const [pickerTarget, setPickerTarget] = React.useState(null);
  const [pickerSearch, setPickerSearch] = React.useState('');

  // ── Manage Fleet dialog state ─────────────────────────────────────
  const [fleetOpen, setFleetOpen] = React.useState(false);
  const [fleetSearch, setFleetSearch] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editReg, setEditReg] = React.useState('');
  const [editMake, setEditMake] = React.useState('');
  const [addMode, setAddMode] = React.useState(false);
  const [newReg, setNewReg] = React.useState('');
  const [newMake, setNewMake] = React.useState('Ford');
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [editDoNotUse, setEditDoNotUse] = React.useState(false);
  const [editReason, setEditReason] = React.useState('');
  const [dnuEditId, setDnuEditId] = React.useState(null);
  const [dnuReason, setDnuReason] = React.useState('');
  const [fleetStationFilter, setFleetStationFilter] = React.useState('All');
  const [editStation, setEditStation] = React.useState(depots[0] || '');
  const [newStation, setNewStation] = React.useState(depots[0] || '');
  const [editTransmission, setEditTransmission] = React.useState('Manual');
  const [newTransmission, setNewTransmission] = React.useState('Manual');

  // ── Auto-assign conflict tracking ──────────────────────────────────
  const [conflicts, setConflicts] = React.useState({});

  // ── Working driver helpers ─────────────────────────────────────────
  // Set of driver IDs working at least 1 day in the selected week
  const workingDriverIds = React.useMemo(() => {
    const ids = new Set();
    if (!week) return ids;
    VAN_DRIVERS.forEach((driver) => {
      if (driver.left) return;
      const shiftKey = `${driver.id}-${week.weekNumber}`;
      const shifts = VAN_DRIVER_SHIFTS[shiftKey] || Array(7).fill('');
      if (shifts.some((code) => WORK_CODES.has(code))) ids.add(driver.id);
    });
    return ids;
  }, [week?.weekNumber, VAN_DRIVERS, VAN_DRIVER_SHIFTS]);

  // Check if a specific driver is working on a specific day of the week
  const isDriverWorkingOnDay = React.useCallback((driverId, dayIndex) => {
    if (!week) return false;
    const shiftKey = `${driverId}-${week.weekNumber}`;
    const shifts = VAN_DRIVER_SHIFTS[shiftKey] || Array(7).fill('');
    return WORK_CODES.has(shifts[dayIndex]);
  }, [week?.weekNumber, VAN_DRIVER_SHIFTS]);

  const filteredDrivers = VAN_DRIVERS.filter((driver) => {
    if (driver.left) return false;
    if (!workingDriverIds.has(driver.id)) return false;
    if (nameFilter && !driver.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (infoFilter) {
      const dInfo = (driver.info || '').toLowerCase();
      if (!dInfo.includes(infoFilter.toLowerCase())) return false;
    }
    for (let d = 0; d < 7; d++) {
      if (dayFilters[d]) {
        const dateKey = `${driver.id}-${week.days[d]}`;
        const code = vanSchedule[dateKey] || '';
        if (!code.toUpperCase().includes(dayFilters[d].toUpperCase())) return false;
      }
    }
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Which vans are assigned on the picker's date
  const assignedOnDate = React.useMemo(() => {
    if (!pickerTarget) return new Set();
    const used = new Set();
    VAN_DRIVERS.forEach((driver) => {
      const key = `${driver.id}-${pickerTarget.date}`;
      const code = vanSchedule[key];
      if (code) used.add(code);
    });
    return used;
  }, [pickerTarget, vanSchedule]);

  const handleCellClick = (e, driverId, date) => {
    setPickerTarget({ driverId, date });
    setPickerAnchor(e.currentTarget);
    setPickerSearch('');
  };

  const handleAssignVan = async (reg) => {
    if (!pickerTarget) return;
    const key = `${pickerTarget.driverId}-${pickerTarget.date}`;
    try {
      // Look up van by reg — search all vans, not just filtered fleet
      let van = fleet.find((v) => v.reg === reg);
      if (!van) {
        // Van might be at another station — fetch all vans to find it
        const allVans = await vansApi.list({});
        van = (allVans.data || []).find((v) => v.registration === reg);
      }
      if (!van) { console.error('Van not found:', reg); return; }
      const vanId = van.id || van.id;
      await vansApi.assign({ driver_id: pickerTarget.driverId, van_id: vanId, assign_date: pickerTarget.date });
      setVanSchedule((prev) => ({ ...prev, [key]: reg }));
      setConflicts((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } catch (err) {
      console.error('Failed to save van assignment:', err);
      alert('Failed to assign van: ' + (err.message || err));
    }
    setPickerAnchor(null);
    setPickerTarget(null);
  };

  const handleClearVan = async () => {
    if (!pickerTarget) return;
    const key = `${pickerTarget.driverId}-${pickerTarget.date}`;
    // Find and delete the assignment from backend
    try {
      const res = await vansApi.assignments({ driverId: pickerTarget.driverId, startDate: pickerTarget.date, endDate: pickerTarget.date });
      const existing = (res.data || []);
      for (const a of existing) {
        await vansApi.deleteAssignment(a.id);
      }
    } catch (err) {
      console.error('Failed to clear van assignment:', err);
    }
    setVanSchedule((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setConflicts((prev) => { const next = { ...prev }; delete next[key]; return next; });
    setPickerAnchor(null);
    setPickerTarget(null);
  };

  const handleClosePicker = () => {
    setPickerAnchor(null);
    setPickerTarget(null);
  };

  // Filter van fleet in picker (by depot + search, Do Not Use sorted to bottom)
  const filteredFleetPicker = fleet.filter((v) => {
    if (depot !== ALL && v.station !== depot) return false;
    if (!pickerSearch) return true;
    const q = pickerSearch.toUpperCase();
    return v.reg.includes(q) || v.make.toUpperCase().includes(q) || (v.station || '').toUpperCase().includes(q);
  }).sort((a, b) => (a.doNotUse === b.doNotUse ? 0 : a.doNotUse ? 1 : -1));

  // Filter van fleet in manage dialog
  const filteredFleetDialog = fleet.filter((v) => {
    if (fleetStationFilter !== 'All' && v.station !== fleetStationFilter) return false;
    if (!fleetSearch) return true;
    const q = fleetSearch.toUpperCase();
    return v.reg.includes(q) || v.make.toUpperCase().includes(q) || (v.station || '').toUpperCase().includes(q) || (v.reason || '').toUpperCase().includes(q);
  });

  const handleExportExcel = () => {
    const rows = filteredDrivers.map((driver, idx) => {
      const row = { '#': idx + 1, Name: driver.name, 'Transporter ID': driver.info || '' };
      week.days.forEach((day, i) => {
        row[`${DAY_LABELS[i]} ${formatShortDate(day)}`] = vanSchedule[`${driver.id}-${day}`] || '';
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Week ${week.weekNumber}`);
    const depotLabel = depot === ALL ? 'All' : depot;
    XLSX.writeFile(wb, `Vans_Week${week.weekNumber}_${depotLabel}.xlsx`);
  };

  const currentCellVan = pickerTarget
    ? vanSchedule[`${pickerTarget.driverId}-${pickerTarget.date}`] || ''
    : '';

  // ── Manage Fleet handlers ─────────────────────────────────────────
  const handleStartEdit = (van) => {
    setEditingId(van.id);
    setEditReg(van.reg);
    setEditMake(van.make);
    setEditStation(van.station || 'Heathrow');
    setEditTransmission(van.transmission || 'Manual');
    setEditDoNotUse(van.doNotUse || false);
    setEditReason(van.reason || '');
  };

  const handleSaveEdit = async () => {
    const trimmedReg = editReg.trim().toUpperCase();
    if (!trimmedReg) return;
    try {
      await vansApi.update(editingId, { registration: trimmedReg, make: editMake, station: editStation, transmission: editTransmission });
      setFleet((prev) =>
        prev.map((v) => v.id === editingId ? { ...v, reg: trimmedReg, make: editMake, station: editStation, transmission: editTransmission, doNotUse: editDoNotUse, reason: editDoNotUse ? editReason : '' } : v)
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update van:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddVan = async () => {
    const trimmedReg = newReg.trim().toUpperCase();
    if (!trimmedReg) return;
    if (fleet.some((v) => v.reg === trimmedReg)) return;
    try {
      const res = await vansApi.create({ registration: trimmedReg, make: newMake, station: newStation, transmission: newTransmission });
      const v = res.data || res;
      setFleet((prev) => [...prev, { id: v.id, reg: v.registration, make: v.make, station: v.station, transmission: v.transmission || 'Manual', doNotUse: false, reason: '' }]);
      setNewReg('');
      setNewMake('Ford');
      setNewStation(depots[0] || 'Heathrow');
      setNewTransmission('Manual');
      setAddMode(false);
    } catch (err) {
      console.error('Failed to add van:', err);
      alert('Failed to add van: ' + (err.message || err));
    }
  };

  const handleDeleteVan = async (id) => {
    try {
      await vansApi.remove(id);
      setFleet((prev) => prev.filter((v) => v.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete van:', err);
    }
  };

  const handleMarkDoNotUse = (vanId) => {
    setDnuEditId(vanId);
    setDnuReason('');
  };

  const handleSaveDnu = () => {
    setFleet((prev) =>
      prev.map((v) => v.id === dnuEditId ? { ...v, doNotUse: true, reason: dnuReason } : v)
    );
    setDnuEditId(null);
    setDnuReason('');
  };

  const handleCancelDnu = () => {
    setDnuEditId(null);
    setDnuReason('');
  };

  const handleRestoreVan = (vanId) => {
    setFleet((prev) =>
      prev.map((v) => v.id === vanId ? { ...v, doNotUse: false, reason: '' } : v)
    );
  };

  // ── Auto-assign handler ─────────────────────────────────────────────
  const handleAutoAssign = () => {
    const newSchedule = { ...vanSchedule };
    const needsAssignment = {};

    // Build set of Do Not Use regs
    const doNotUseRegs = new Set(fleet.filter((v) => v.doNotUse).map((v) => v.reg));

    // Helper: find most recently used van for a driver before a given date
    function findPreviousVan(driverId, beforeDate) {
      let bestDate = null;
      let bestVan = null;
      const prefix = `${driverId}-`;
      for (const key of Object.keys(newSchedule)) {
        if (!key.startsWith(prefix)) continue;
        const dateStr = key.slice(prefix.length);
        if (dateStr >= beforeDate) continue;
        if (!newSchedule[key]) continue;
        if (bestDate === null || dateStr > bestDate) {
          bestDate = dateStr;
          bestVan = newSchedule[key];
        }
      }
      return bestVan;
    }

    // Process each day in the selected week
    week.days.forEach((day, dayIndex) => {
      const vanWants = {}; // van reg → [driverId, ...]

      VAN_DRIVERS.forEach((driver) => {
        if (driver.left) return;
        if (!workingDriverIds.has(driver.id)) return;
        if (!isDriverWorkingOnDay(driver.id, dayIndex)) return;

        const currentKey = `${driver.id}-${day}`;
        // Skip drivers who already have a van assigned
        if (newSchedule[currentKey]) return;

        const prevVan = findPreviousVan(driver.id, day);
        if (!prevVan || doNotUseRegs.has(prevVan)) {
          // No previous van or it's Do Not Use — needs manual assignment
          needsAssignment[currentKey] = true;
          return;
        }

        if (!vanWants[prevVan]) vanWants[prevVan] = [];
        vanWants[prevVan].push(driver.id);
      });

      // Assign non-conflicting; conflicting (2+ drivers want same van) → no assignment
      Object.entries(vanWants).forEach(([van, driverIds]) => {
        if (driverIds.length === 1) {
          newSchedule[`${driverIds[0]}-${day}`] = van;
        } else {
          // 2+ drivers want the same van — assign to none, mark all for manual
          driverIds.forEach((driverId) => {
            needsAssignment[`${driverId}-${day}`] = true;
          });
        }
      });
    });

    setVanSchedule(newSchedule);
    setConflicts(needsAssignment);
  };

  if (!week || ROTA_WEEKS.length === 0) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  }

  return (
    <Box>
      {/* ── Header bar ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        {/* Title + Manage Fleet + Auto Assign */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6">Vans</Typography>
          <IconButton onClick={() => { setFleetOpen(true); setFleetSearch(''); setFleetStationFilter('All'); setAddMode(false); setEditingId(null); setDeleteConfirm(null); setDnuEditId(null); }} sx={pillBtnSx} title="Manage Fleet">
            <SettingsIcon sx={{ fontSize: 18, mr: 0.5 }} />
            <Typography component="span" sx={{ fontWeight: 700, fontSize: 13 }}>Manage Fleet</Typography>
          </IconButton>
          <IconButton onClick={handleAutoAssign} sx={pillBtnSx} title="Auto Assign">
            <AutoAwesomeIcon sx={{ fontSize: 18, mr: 0.5 }} />
            <Typography component="span" sx={{ fontWeight: 700, fontSize: 13 }}>Auto Assign</Typography>
          </IconButton>
        </Box>

        {/* Week navigator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" disabled={weekIdx === 0} onClick={() => { setWeekIdx((i) => i - 1); setConflicts({}); }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 180, textAlign: 'center', userSelect: 'none' }}>
            {week ? `Week ${week.weekNumber} (${formatWeekRange(week)})` : 'Loading...'}
          </Typography>
          <IconButton size="small" disabled={weekIdx === ROTA_WEEKS.length - 1} onClick={() => { setWeekIdx((i) => i + 1); setConflicts({}); }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Download + Depot selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleExportExcel} sx={pillBtnSx} title="Download as Excel">
            <FileDownloadIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={(e) => setDepotEl(e.currentTarget)} sx={pillBtnSx}>
            <Typography component="span" sx={{ mr: 1, fontWeight: 700, fontSize: 14 }}>{depot}</Typography>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={depotEl}
            open={Boolean(depotEl)}
            onClose={() => setDepotEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            PaperProps={{ sx: menuPaperSx }}
            MenuListProps={{ dense: true, sx: menuListSx }}
          >
            {depotOptions.map((d) => (
              <MenuItem key={d} onClick={() => { setDepot(d); setDepotEl(null); }} sx={navLikeItemSx}>{d}</MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* ── Van assignment table ─────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                <TableCell sx={{ ...headCellSx, width: 36, ...stickyHeadSx(0) }}>#</TableCell>
                <TableCell sx={{ ...headCellSx, minWidth: 150, ...stickyHeadSx(36) }}>Name</TableCell>
                <TableCell sx={{ ...headCellSx, minWidth: 80, ...stickyHeadSx(186) }}>Transporter ID</TableCell>
                {week.days.map((day, i) => (
                  <TableCell key={day} align="center" sx={{ ...headCellSx, minWidth: 60 }}>
                    {DAY_LABELS[i]}<br />
                    <span style={{ fontWeight: 400, fontSize: 10 }}>{formatShortDate(day)}</span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Filter row */}
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(0), bgcolor: '#FAFAFA' }} />
                <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(36), bgcolor: '#FAFAFA' }}>
                  <input value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} placeholder="Filter..." style={filterInputSx} />
                </TableCell>
                <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(186), bgcolor: '#FAFAFA' }}>
                  <input value={infoFilter} onChange={(e) => setInfoFilter(e.target.value)} placeholder="Filter..." style={filterInputSx} />
                </TableCell>
                {week.days.map((day, i) => (
                  <TableCell key={day} align="center" sx={{ ...cellSx, p: 0.5 }}>
                    <input
                      value={dayFilters[i]}
                      onChange={(e) => { const next = [...dayFilters]; next[i] = e.target.value.toUpperCase(); setDayFilters(next); }}
                      placeholder="—"
                      style={{ ...filterInputSx, width: 36 }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredDrivers.map((driver, idx) => (
                <TableRow key={driver.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFAFA' } }}>
                  <TableCell sx={{ ...cellSx, fontWeight: 600, textAlign: 'center', ...stickyCellSx(0, 1) }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 600, ...stickyCellSx(36) }}>
                    {driver.name}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, fontSize: 10, color: 'text.secondary', ...stickyCellSx(186) }}>
                    {driver.info || ''}
                  </TableCell>

                  {week.days.map((day, d) => {
                    const code = vanSchedule[`${driver.id}-${day}`] || '';
                    const isWorking = isDriverWorkingOnDay(driver.id, d);
                    const hasConflict = Boolean(conflicts[`${driver.id}-${day}`]);
                    return (
                      <TableCell
                        key={d}
                        align="center"
                        sx={{
                          ...cellSx,
                          cursor: isWorking ? 'pointer' : 'default',
                          '&:hover': isWorking ? { bgcolor: hasConflict ? '#FFCDD2' : '#F0F0F0' } : {},
                          p: 0.25,
                          ...(!isWorking && { bgcolor: '#F0F0F0', opacity: 0.4 }),
                          ...(hasConflict && { bgcolor: '#FFEBEE', border: '2px solid #EF5350' }),
                        }}
                        onClick={isWorking ? (e) => handleCellClick(e, driver.id, day) : undefined}
                      >
                        {code ? <VanChip code={code} /> : (
                          isWorking
                            ? <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                            : <Typography sx={{ fontSize: 9, color: 'text.disabled' }}>OFF</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: 13 }}>
                    No drivers match the selected filter.
                  </TableCell>
                </TableRow>
              )}

              {/* ── DA Capacity summary row ───────────────────────────── */}
              <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                <TableCell sx={{ ...cellSx, fontWeight: 700, textAlign: 'center', ...stickyCellSx(0, 1), bgcolor: '#E8F5E9' }} />
                <TableCell sx={{ ...cellSx, fontWeight: 700, ...stickyCellSx(36), bgcolor: '#E8F5E9' }}>
                  DA Capacity
                </TableCell>
                <TableCell sx={{ ...cellSx, ...stickyCellSx(186), bgcolor: '#E8F5E9' }} />
                {week.days.map((day, d) => {
                  const count = VAN_DRIVERS.filter((driver) =>
                    !driver.left && workingDriverIds.has(driver.id) && isDriverWorkingOnDay(driver.id, d)
                  ).length;
                  return (
                    <TableCell key={d} align="center" sx={{ ...cellSx, fontWeight: 700, fontSize: 12, color: '#2E7D32', bgcolor: '#E8F5E9' }}>
                      {count}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* ── Van picker popover ───────────────────────────────────── */}
      <Popover
        open={Boolean(pickerAnchor)}
        anchorEl={pickerAnchor}
        onClose={handleClosePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            width: 260,
            maxHeight: 380,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ p: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75, color: 'text.secondary' }}>
            Assign Van
          </Typography>
          <input
            autoFocus
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search reg or make..."
            style={{
              width: '100%',
              height: 28,
              border: '1px solid #D0D0D0',
              borderRadius: 6,
              fontSize: 12,
              outline: 'none',
              padding: '0 8px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          {currentCellVan && (
            <Box
              onClick={handleClearVan}
              sx={{
                mt: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                fontSize: 11,
                color: '#B71C1C',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <ClearIcon sx={{ fontSize: 14 }} />
              Remove {currentCellVan}
            </Box>
          )}
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {filteredFleetPicker.map((van) => {
            const isAssigned = assignedOnDate.has(van.reg);
            const isCurrent = van.reg === currentCellVan;
            const isDoNotUse = van.doNotUse;
            const style = MAKE_COLORS[van.make] || { color: '#37474F', bg: '#ECEFF1' };
            return (
              <Box
                key={van.id}
                onClick={() => !isDoNotUse && handleAssignVan(van.reg)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 0.6,
                  cursor: isDoNotUse ? 'not-allowed' : 'pointer',
                  bgcolor: isCurrent ? 'rgba(46,76,30,0.08)' : isDoNotUse ? '#FFF5F5' : 'transparent',
                  '&:hover': { bgcolor: isDoNotUse ? '#FFF5F5' : 'rgba(46,76,30,0.06)' },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  opacity: isDoNotUse ? 0.45 : (isAssigned && !isCurrent ? 0.45 : 1),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{
                    fontWeight: 700, fontSize: 12, color: style.color, letterSpacing: 0.5,
                    textDecoration: isDoNotUse ? 'line-through' : 'none',
                  }}>
                    {van.reg}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                    {van.make}
                  </Typography>
                </Box>
                {isDoNotUse && (
                  <Typography sx={{ fontSize: 9, color: '#B71C1C', fontStyle: 'italic' }}>do not use</Typography>
                )}
                {!isDoNotUse && isAssigned && !isCurrent && (
                  <Typography sx={{ fontSize: 9, color: 'text.disabled', fontStyle: 'italic' }}>in use</Typography>
                )}
                {!isDoNotUse && isCurrent && (
                  <Typography sx={{ fontSize: 9, color: 'primary.main', fontWeight: 700 }}>current</Typography>
                )}
              </Box>
            );
          })}
          {filteredFleetPicker.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>No vans found</Typography>
          )}
        </Box>
      </Popover>

      {/* ── Manage Fleet Dialog ──────────────────────────────────── */}
      <Dialog
        open={fleetOpen}
        onClose={() => setFleetOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Manage Fleet</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {fleet.length} vans · {fleet.filter((v) => v.doNotUse).length} do not use
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!addMode && (
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setAddMode(true); setNewReg(''); setNewMake('Ford'); setNewStation(depots[0] || ''); setNewTransmission('Manual'); }}
                sx={{
                  bgcolor: '#2E4C1E',
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#3d6528' },
                }}
              >
                Add Van
              </Button>
            )}
            <IconButton size="small" onClick={() => setFleetOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 2 }}>
          {/* Station filter chips */}
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
            {['All', ...depots].map((s) => (
              <Chip
                key={s}
                label={s === 'All' ? `All (${fleet.length})` : `${s} (${fleet.filter((v) => v.station === s).length})`}
                size="small"
                onClick={() => setFleetStationFilter(s)}
                sx={{
                  fontWeight: 600,
                  fontSize: 11,
                  height: 26,
                  cursor: 'pointer',
                  bgcolor: fleetStationFilter === s ? '#2E4C1E' : '#F5F5F5',
                  color: fleetStationFilter === s ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: fleetStationFilter === s ? '#3d6528' : '#E0E0E0' },
                }}
              />
            ))}
          </Box>

          {/* Search */}
          <Box sx={{ mb: 1.5 }}>
            <input
              value={fleetSearch}
              onChange={(e) => setFleetSearch(e.target.value)}
              placeholder="Search reg, make, or station..."
              style={{
                width: '100%',
                height: 32,
                border: '1px solid #D0D0D0',
                borderRadius: 6,
                fontSize: 13,
                outline: 'none',
                padding: '0 10px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </Box>

          {/* Add van row */}
          {addMode && (
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: '#F5F5F5',
              }}
            >
              <TextField
                size="small"
                label="Reg Code"
                value={newReg}
                onChange={(e) => setNewReg(e.target.value.toUpperCase())}
                sx={{ flex: 1, '& .MuiInputBase-root': { height: 34, fontSize: 13 } }}
                autoFocus
              />
              <TextField
                size="small"
                label="Make"
                value={newMake}
                onChange={(e) => setNewMake(e.target.value)}
                sx={{ flex: 1, '& .MuiInputBase-root': { height: 34, fontSize: 13 } }}
              />
              <Select
                native
                size="small"
                value={newStation}
                onChange={(e) => setNewStation(e.target.value)}
                sx={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {depots.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <Chip
                label={newTransmission === 'Auto' ? 'Auto' : 'Manual'}
                size="small"
                onClick={() => setNewTransmission((p) => p === 'Manual' ? 'Auto' : 'Manual')}
                sx={{
                  fontWeight: 600, fontSize: 11, height: 34, cursor: 'pointer',
                  bgcolor: newTransmission === 'Auto' ? '#E3F2FD' : '#F5F5F5',
                  color: newTransmission === 'Auto' ? '#0D47A1' : '#37474F',
                  '&:hover': { bgcolor: newTransmission === 'Auto' ? '#BBDEFB' : '#E0E0E0' },
                }}
              />
              <IconButton size="small" onClick={handleAddVan} sx={{ color: '#2E7D32' }} title="Save">
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setAddMode(false)} title="Cancel">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Paper>
          )}

          {/* Fleet table */}
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, width: 36 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Reg</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Make</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Station</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, width: 90 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFleetDialog.map((van, idx) => {
                  const isEditing = editingId === van.id;
                  const isDeleting = deleteConfirm === van.id;
                  const isDnuEditing = dnuEditId === van.id;
                  const style = MAKE_COLORS[van.make] || DEFAULT_MAKE_STYLE;
                  const rowTint = van.doNotUse ? '#FFF5F5' : undefined;

                  return (
                    <TableRow key={van.id} sx={{ '&:nth-of-type(even)': { bgcolor: rowTint || '#FAFAFA' }, bgcolor: rowTint }}>
                      <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{idx + 1}</TableCell>

                      {isEditing ? (
                        <>
                          <TableCell>
                            <TextField
                              size="small"
                              value={editReg}
                              onChange={(e) => setEditReg(e.target.value.toUpperCase())}
                              sx={{ '& .MuiInputBase-root': { height: 28, fontSize: 12 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={editMake}
                              onChange={(e) => setEditMake(e.target.value)}
                              sx={{ '& .MuiInputBase-root': { height: 28, fontSize: 12 }, minWidth: 90 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={editTransmission === 'Auto' ? 'Auto' : 'Manual'}
                              size="small"
                              onClick={() => setEditTransmission((p) => p === 'Manual' ? 'Auto' : 'Manual')}
                              sx={{
                                fontWeight: 600, fontSize: 10, height: 22, cursor: 'pointer',
                                bgcolor: editTransmission === 'Auto' ? '#E3F2FD' : '#F5F5F5',
                                color: editTransmission === 'Auto' ? '#0D47A1' : '#37474F',
                                '&:hover': { bgcolor: editTransmission === 'Auto' ? '#BBDEFB' : '#E0E0E0' },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              native
                              size="small"
                              value={editStation}
                              onChange={(e) => setEditStation(e.target.value)}
                              sx={{ height: 28, fontSize: 12, minWidth: 100 }}
                            >
                              {depots.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box
                                onClick={() => setEditDoNotUse(!editDoNotUse)}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                              >
                                <Box
                                  sx={{
                                    width: 14, height: 14, borderRadius: 0.5,
                                    border: '2px solid',
                                    borderColor: editDoNotUse ? '#B71C1C' : '#BDBDBD',
                                    bgcolor: editDoNotUse ? '#B71C1C' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  {editDoNotUse && <CheckIcon sx={{ fontSize: 10, color: '#fff' }} />}
                                </Box>
                                <Typography sx={{ fontSize: 11, color: editDoNotUse ? '#B71C1C' : 'text.secondary' }}>
                                  Do Not Use
                                </Typography>
                              </Box>
                              {editDoNotUse && (
                                <TextField
                                  size="small"
                                  placeholder="Reason..."
                                  value={editReason}
                                  onChange={(e) => setEditReason(e.target.value)}
                                  sx={{ '& .MuiInputBase-root': { height: 26, fontSize: 11 } }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={handleSaveEdit} sx={{ color: '#2E7D32' }}>
                              <CheckIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancelEdit}>
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <Typography sx={{
                              fontWeight: 700, fontSize: 12, color: style.color, letterSpacing: 0.5,
                              textDecoration: van.doNotUse ? 'line-through' : 'none',
                              opacity: van.doNotUse ? 0.6 : 1,
                            }}>
                              {van.reg}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={van.make}
                              size="small"
                              sx={{
                                bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: 11, height: 22,
                                opacity: van.doNotUse ? 0.6 : 1,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={van.transmission === 'Auto' ? 'Auto' : 'Manual'}
                              size="small"
                              sx={{
                                fontWeight: 600, fontSize: 10, height: 20,
                                bgcolor: van.transmission === 'Auto' ? '#E3F2FD' : '#F5F5F5',
                                color: van.transmission === 'Auto' ? '#0D47A1' : '#37474F',
                                opacity: van.doNotUse ? 0.6 : 1,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary', opacity: van.doNotUse ? 0.6 : 1 }}>
                              {van.station || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {van.doNotUse ? (
                              <Box>
                                <Chip
                                  label="Do Not Use"
                                  size="small"
                                  sx={{ bgcolor: '#FFEBEE', color: '#B71C1C', fontWeight: 600, fontSize: 10, height: 20 }}
                                />
                                {van.reason && (
                                  <Typography sx={{ fontSize: 10, color: 'text.secondary', fontStyle: 'italic', mt: 0.25 }}>
                                    {van.reason}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Chip
                                label="Active"
                                size="small"
                                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 10, height: 20 }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {isDnuEditing ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TextField
                                  size="small"
                                  placeholder="Reason..."
                                  value={dnuReason}
                                  onChange={(e) => setDnuReason(e.target.value)}
                                  sx={{ '& .MuiInputBase-root': { height: 26, fontSize: 11 }, minWidth: 120 }}
                                  autoFocus
                                />
                                <IconButton size="small" onClick={handleSaveDnu} sx={{ color: '#B71C1C' }}>
                                  <CheckIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                                <IconButton size="small" onClick={handleCancelDnu}>
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ) : isDeleting ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Typography sx={{ fontSize: 10, color: '#B71C1C', mr: 0.5 }}>Delete?</Typography>
                                <IconButton size="small" onClick={() => handleDeleteVan(van.id)} sx={{ color: '#B71C1C' }}>
                                  <CheckIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                                <IconButton size="small" onClick={() => setDeleteConfirm(null)}>
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ) : (
                              <>
                                <IconButton size="small" onClick={() => handleStartEdit(van)}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                {van.doNotUse ? (
                                  <IconButton size="small" onClick={() => handleRestoreVan(van.id)} sx={{ color: '#2E7D32' }} title="Restore">
                                    <CheckIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                ) : (
                                  <IconButton size="small" onClick={() => handleMarkDoNotUse(van.id)} sx={{ color: '#FF6F00' }} title="Mark Do Not Use">
                                    <ClearIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                )}
                                <IconButton size="small" onClick={() => setDeleteConfirm(van.id)} sx={{ color: '#B71C1C' }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── Fleet legend ─────────────────────────────────────────── */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
        {Object.entries(MAKE_COLORS).map(([make, { color, bg }]) => (
          <Chip
            key={make}
            label={make}
            size="small"
            sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: 11, height: 24 }}
          />
        ))}
        <Typography sx={{ fontSize: 11, color: 'text.secondary', ml: 1 }}>
          {fleet.filter((v) => !v.doNotUse).length} active · {fleet.filter((v) => v.doNotUse).length} do not use · {fleet.length} total
        </Typography>
      </Box>
    </Box>
  );
}

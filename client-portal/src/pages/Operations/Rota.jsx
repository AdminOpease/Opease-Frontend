// src/pages/Operations/Rota.jsx
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
  ClickAwayListener,
  Menu,
  MenuItem,
  Popover,
  CircularProgress,
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import NotesIcon from '@mui/icons-material/StickyNote2';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { useAppStore } from '../../state/AppStore.jsx';
import ShiftChip from '../../components/operations/ShiftChip';
import { SHIFT_CODES, WORK_CODES, countWorkDays } from '../../data/rotaDemoData';
import { rota as rotaApi } from '../../services/api';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

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

function formatWeekRange(week) {
  if (!week) return '';
  const s = new Date(week.startDate + 'T00:00:00');
  const e = new Date(week.endDate + 'T00:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}`;
}

function buildDaysFromWeek(startDate) {
  // Use UTC noon to avoid DST boundary shifts
  const days = [];
  const s = new Date(startDate + 'T12:00:00Z');
  for (let d = 0; d < 7; d++) {
    const dt = new Date(s.getTime() + d * 86400000);
    days.push(dt.toISOString().slice(0, 10));
  }
  return days;
}

// ── Depot pill button (matches Drivers / ExpiringDocs) ───────────
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

export default function Rota() {
  const { depots } = useAppStore();
  const depotOptions = [ALL, ...depots];
  const [depot, setDepot] = React.useState('DLU2');
  const [depotEl, setDepotEl] = React.useState(null);

  // Data from API
  const [weeks, setWeeks] = React.useState([]);
  const [weekIdx, setWeekIdx] = React.useState(0);
  const [scheduleRows, setScheduleRows] = React.useState([]);
  const [loadingWeeks, setLoadingWeeks] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(false);

  // Column filters
  const [nameFilter, setNameFilter] = React.useState('');
  const [idFilter, setIdFilter] = React.useState('');
  const [dayFilters, setDayFilters] = React.useState(Array(7).fill(''));

  // DA Capacity popover
  const [capacityEl, setCapacityEl] = React.useState(null);

  // Inline edit state
  const [editTarget, setEditTarget] = React.useState(null);
  const [editValue, setEditValue] = React.useState('');
  const editRef = React.useRef(null);

  // Extra column edit state (support/other)
  const [extraEditTarget, setExtraEditTarget] = React.useState(null); // { driverId, field: 'support'|'other' }
  const [extraEditValue, setExtraEditValue] = React.useState('');
  const extraEditRef = React.useRef(null);

  // Notes dialog state
  const [notesTarget, setNotesTarget] = React.useState(null); // { driverId, scheduleId }
  const [notesValue, setNotesValue] = React.useState('');

  // Custom shift codes (add/remove chips)
  const [customCodes, setCustomCodes] = React.useState({ ...SHIFT_CODES });
  const [addChipOpen, setAddChipOpen] = React.useState(false);
  const [newChip, setNewChip] = React.useState({ code: '', color: '#333333', bg: '#F5F5F5' });

  // Availability state
  const [availStatus, setAvailStatus] = React.useState(null); // null | { pending, submitted, total }
  const [availLoading, setAvailLoading] = React.useState(false);
  const [availNotes, setAvailNotes] = React.useState({}); // { driverId: { notes, status } }

  // ── Fetch weeks on mount ──
  React.useEffect(() => {
    rotaApi.weeks().then((res) => {
      const apiWeeks = (res.data || []).map((w) => ({
        id: w.id,
        weekNumber: w.week_number,
        startDate: w.start_date,
        endDate: w.end_date,
        days: buildDaysFromWeek(w.start_date),
      }));
      setWeeks(apiWeeks);
      // Default to current week
      const today = new Date().toISOString().slice(0, 10);
      const currentIdx = apiWeeks.findIndex((w) => w.startDate <= today && w.endDate >= today);
      if (currentIdx >= 0) setWeekIdx(currentIdx);
      setLoadingWeeks(false);
    }).catch((err) => {
      console.error('Failed to fetch weeks:', err);
      setLoadingWeeks(false);
    });
  }, []);

  const week = weeks[weekIdx];

  // ── Fetch schedule when week or depot changes ──
  React.useEffect(() => {
    if (!week) return;
    setLoadingSchedule(true);
    const params = { weekId: week.id };
    if (depot !== ALL) params.depot = depot;
    rotaApi.schedule(params).then((res) => {
      setScheduleRows(res.data || []);
      setLoadingSchedule(false);
    }).catch((err) => {
      console.error('Failed to fetch schedule:', err);
      setLoadingSchedule(false);
    });
  }, [week?.id, depot]);

  // ── Fetch availability status when week/depot changes ──
  const fetchAvailStatus = React.useCallback(() => {
    if (!week || depot === ALL) { setAvailStatus(null); setAvailNotes({}); return; }
    rotaApi.getAvailability({ weekId: week.id, depot }).then((res) => {
      const rows = res.data || [];
      if (rows.length === 0) { setAvailStatus(null); setAvailNotes({}); return; }
      const pending = rows.filter((r) => r.status === 'pending').length;
      const submitted = rows.filter((r) => r.status === 'submitted').length;
      setAvailStatus({ pending, submitted, total: rows.length });
      // Store notes per driver
      const notesMap = {};
      for (const r of rows) {
        notesMap[r.driver_id] = { notes: r.notes || '', status: r.status };
      }
      setAvailNotes(notesMap);
    }).catch(() => { setAvailStatus(null); setAvailNotes({}); });
  }, [week?.id, depot]);

  React.useEffect(() => { fetchAvailStatus(); }, [fetchAvailStatus]);

  const handleRequestAvailability = async () => {
    if (!week || depot === ALL) return;
    setAvailLoading(true);
    try {
      const res = await rotaApi.requestAvailability({ weekId: week.id, depot });
      alert(`Availability requested from ${res.total} drivers (${res.created} new, ${res.alreadyRequested} already sent)`);
      fetchAvailStatus();
    } catch (err) {
      alert('Failed: ' + (err.message || err));
    }
    setAvailLoading(false);
  };

  const handleApplyAvailability = async () => {
    if (!week || depot === ALL) return;
    setAvailLoading(true);
    try {
      const res = await rotaApi.applyAvailability({ weekId: week.id, depot });
      alert(`Applied availability for ${res.applied} drivers`);
      // Refresh the schedule
      const params = { weekId: week.id };
      if (depot !== ALL) params.depot = depot;
      const schedRes = await rotaApi.schedule(params);
      setScheduleRows(schedRes.data || []);
      fetchAvailStatus();
    } catch (err) {
      alert('Failed: ' + (err.message || err));
    }
    setAvailLoading(false);
  };

  // ── Transform schedule into drivers + schedule map ──
  const drivers = React.useMemo(() => {
    const seen = new Map();
    for (const row of scheduleRows) {
      if (!seen.has(row.driver_id)) {
        seen.set(row.driver_id, {
          id: row.driver_id,
          name: `${row.first_name} ${row.last_name}`,
          amazonId: row.transporter_id || row.amazon_id || '',
          depot: row.depot,
        });
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [scheduleRows]);

  // scheduleMap: driverId -> { id, shifts: [sun, mon, ...] }
  const scheduleMap = React.useMemo(() => {
    const map = {};
    for (const row of scheduleRows) {
      map[row.driver_id] = {
        id: row.id,
        shifts: DAY_COLS.map((d) => row[d] || ''),
        support: row.support || '',
        other: row.other || '',
        notes: row.notes || '',
        _transferred_in: row._transferred_in || false,
        _transfer_days: row._transfer_days || {},
        _outgoing_transfers: row._outgoing_transfers || {},
      };
    }
    return map;
  }, [scheduleRows]);

  const filteredDrivers = drivers.filter((driver) => {
    if (nameFilter && !driver.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (idFilter && !driver.amazonId.toLowerCase().includes(idFilter.toLowerCase())) return false;
    const entry = scheduleMap[driver.id];
    const shifts = entry ? entry.shifts : Array(7).fill('');
    for (let d = 0; d < 7; d++) {
      if (dayFilters[d] && shifts[d].toUpperCase() !== dayFilters[d].toUpperCase()) return false;
    }
    return true;
  });

  // ── DA Capacity ──
  const capacity = React.useMemo(() => {
    const TRACKED = new Set(['SD', 'SWA', 'NL1', 'NL2', 'NL3', 'NL4', 'RA', 'SB']);
    const WORK_SET = new Set(['W', 'Office', 'OfficeLD', 'SD', 'Fleet', 'SB', 'DR', 'C', 'C2', 'NL3', '1P', 'SWA', 'DHW', 'MT']);
    const days = Array.from({ length: 7 }, () => ({ working: 0, rest: 0, sd: 0, swa: 0, nl1: 0, nl2: 0, nl3: 0, nl4: 0, ra: 0, sb: 0 }));

    for (const driver of drivers) {
      const entry = scheduleMap[driver.id];
      const shifts = entry ? entry.shifts : Array(7).fill('');
      shifts.forEach((code, d) => {
        if (code === 'SD') days[d].sd += 1;
        else if (code === 'SWA') days[d].swa += 1;
        else if (code === 'NL1') days[d].nl1 += 1;
        else if (code === 'NL2') days[d].nl2 += 1;
        else if (code === 'NL3') days[d].nl3 += 1;
        else if (code === 'NL4') days[d].nl4 += 1;
        else if (code === 'RA') days[d].ra += 1;
        else if (code === 'SB') days[d].sb += 1;
        else if (code === 'R' || code === '') days[d].rest += 1;
        if (WORK_SET.has(code) && !TRACKED.has(code)) days[d].working += 1;
      });
    }
    return days;
  }, [drivers, scheduleMap]);

  const handleCellClick = (driverId, dayIndex, currentCode) => {
    setEditTarget({ driverId, dayIndex });
    setEditValue(currentCode || '');
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const handleEditCommit = async () => {
    if (!editTarget) return;
    const { driverId, dayIndex } = editTarget;
    const entry = scheduleMap[driverId];
    if (!entry) return;

    const trimmed = editValue.trim();
    const code = trimmed === '' ? '' : trimmed.toUpperCase();
    const dayCol = DAY_COLS[dayIndex];
    const isStationCode = depots.includes(code);
    const isTransferredIn = Boolean(entry._transferred_in);

    // Optimistic update
    if (isTransferredIn) {
      // For transferred-in drivers, update the _transfer_days assigned_code
      setScheduleRows((prev) =>
        prev.map((row) => {
          if (row.id !== entry.id) return row;
          const updatedTransfers = { ...row._transfer_days };
          if (updatedTransfers[dayCol]) {
            updatedTransfers[dayCol] = { ...updatedTransfers[dayCol], assigned_code: code };
          }
          return { ...row, _transfer_days: updatedTransfers };
        })
      );
    } else {
      setScheduleRows((prev) =>
        prev.map((row) =>
          row.id === entry.id ? { ...row, [dayCol]: code } : row
        )
      );
    }
    setEditTarget(null);
    setEditValue('');

    try {
      if (isTransferredIn) {
        // Editing a transferred-in driver's cell → update the transfer's assigned_code
        await rotaApi.updateTransferAssignment({ schedule_id: entry.id, day_col: dayCol, assigned_code: code });
      } else {
        // Normal edit
        await rotaApi.updateShift(entry.id, { [dayCol]: code || null });

        // If it's a station code → create transfer
        if (isStationCode && code !== depot) {
          await rotaApi.createTransfer({
            schedule_id: entry.id,
            day_col: dayCol,
            from_depot: depot,
            to_depot: code,
          });
        } else {
          // If it was previously a station code, delete the transfer
          const prevCode = entry.shifts[dayIndex];
          if (depots.includes(prevCode)) {
            await rotaApi.deleteTransfer({ schedule_id: entry.id, day_col: dayCol }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error('Failed to save shift:', err);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditCommit();
    } else if (e.key === 'Escape') {
      setEditTarget(null);
      setEditValue('');
    }
  };

  // Extra column (support/other) edit handlers
  const handleExtraClick = (driverId, field, currentVal) => {
    setExtraEditTarget({ driverId, field });
    setExtraEditValue(currentVal || '');
    setTimeout(() => extraEditRef.current?.focus(), 0);
  };

  const handleExtraCommit = async () => {
    if (!extraEditTarget) return;
    const { driverId, field } = extraEditTarget;
    const entry = scheduleMap[driverId];
    if (!entry) return;

    const code = extraEditValue.trim().toUpperCase();
    setScheduleRows((prev) =>
      prev.map((row) => row.id === entry.id ? { ...row, [field]: code } : row)
    );
    setExtraEditTarget(null);
    setExtraEditValue('');

    try {
      await rotaApi.updateShift(entry.id, { [field]: code || '' });
    } catch (err) {
      console.error(`Failed to save ${field}:`, err);
    }
  };

  const handleExtraKeyDown = (e) => {
    if (e.key === 'Enter') handleExtraCommit();
    else if (e.key === 'Escape') { setExtraEditTarget(null); setExtraEditValue(''); }
  };

  // Notes dialog handlers
  const handleNotesOpen = (driverId) => {
    const entry = scheduleMap[driverId];
    if (!entry) return;
    setNotesTarget({ driverId, scheduleId: entry.id });
    setNotesValue(entry.notes || '');
  };

  const handleNotesSave = async () => {
    if (!notesTarget) return;
    setScheduleRows((prev) =>
      prev.map((row) => row.id === notesTarget.scheduleId ? { ...row, notes: notesValue } : row)
    );
    setNotesTarget(null);
    try {
      await rotaApi.updateShift(notesTarget.scheduleId, { notes: notesValue });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleExportExcel = () => {
    if (!week) return;
    // Exclude transferred-in drivers from this station's export
    const exportDrivers = filteredDrivers.filter((d) => !scheduleMap[d.id]?._transferred_in);
    const rows = exportDrivers.map((driver, idx) => {
      const entry = scheduleMap[driver.id];
      const shifts = entry ? entry.shifts : Array(7).fill('');
      const row = {
        '#': idx + 1,
        Name: driver.name,
        'Transporter ID': driver.amazonId,
      };
      const outgoing = entry ? entry._outgoing_transfers : {};
      week.days.forEach((day, i) => {
        const dayCol = DAY_COLS[i];
        let cellVal = shifts[i] || '';
        // For outgoing transfers: show the assigned_code from destination station if available
        if (outgoing[dayCol]?.assigned_code) {
          cellVal = outgoing[dayCol].assigned_code;
        }
        row[`${DAY_LABELS[i]} ${formatShortDate(day)}`] = cellVal;
      });
      row.Total = countWorkDays(shifts);
      row.Support = entry ? entry.support : '';
      row.Other = entry ? entry.other : '';
      row.Notes = entry ? entry.notes : '';
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Week ${week.weekNumber}`);
    const depotLabel = depot === ALL ? 'All' : depot;
    XLSX.writeFile(wb, `Rota_Week${week.weekNumber}_${depotLabel}.xlsx`);
  };

  if (loadingWeeks) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!week) {
    return <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No weeks found.</Typography>;
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
        {/* DA Capacity button */}
        <Typography
          variant="h6"
          onClick={(e) => setCapacityEl(e.currentTarget)}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            '&:hover': { bgcolor: 'rgba(46,76,30,0.06)' },
          }}
        >
          Rota — DA Capacity ▾
        </Typography>

        <Popover
          open={Boolean(capacityEl)}
          anchorEl={capacityEl}
          onClose={() => setCapacityEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              mt: 1,
              p: 2.5,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 620,
            },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
            DA Capacity — Week {week.weekNumber}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>
            {depot === ALL ? 'All Depots' : depot} · {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
          </Typography>

          <Table size="small" sx={{ '& th, & td': { px: 1, py: 0.6, fontSize: 12 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#2E7D32' }}>Working</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#00695C' }}>SD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#AD1457' }}>SWA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#0D47A1' }}>NL1</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#1565C0' }}>NL2</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#00838F' }}>NL3</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#00695C' }}>NL4</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#6A1B9A' }}>RA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#FF6F00' }}>SB</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#616161' }}>Rest</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {week.days.map((day, i) => (
                <TableRow key={day} sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFAFA' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {DAY_LABELS[i]} {formatShortDate(day)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2E7D32' }}>{capacity[i].working}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#00695C' }}>{capacity[i].sd}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#AD1457' }}>{capacity[i].swa}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#0D47A1' }}>{capacity[i].nl1}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#1565C0' }}>{capacity[i].nl2}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#00838F' }}>{capacity[i].nl3}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#00695C' }}>{capacity[i].nl4}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#6A1B9A' }}>{capacity[i].ra}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#FF6F00' }}>{capacity[i].sb}</TableCell>
                  <TableCell align="center" sx={{ color: '#616161' }}>{capacity[i].rest}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {capacity[i].working + capacity[i].sd + capacity[i].swa + capacity[i].nl1 + capacity[i].nl2 + capacity[i].nl3 + capacity[i].nl4}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Popover>

        {/* Week navigator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" disabled={weekIdx === 0} onClick={() => setWeekIdx((i) => i - 1)}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: 13, fontWeight: 600, minWidth: 180, textAlign: 'center', userSelect: 'none' }}>
            Week {week.weekNumber} ({formatWeekRange(week)})
          </Typography>
          <IconButton size="small" disabled={weekIdx === weeks.length - 1} onClick={() => setWeekIdx((i) => i + 1)}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Station selector + Download */}
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

      {/* ── Availability actions ─────────────────────────────── */}
      {depot !== ALL && week && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            disabled={availLoading}
            onClick={handleRequestAvailability}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, fontSize: 12, bgcolor: 'primary.main' }}
          >
            {availLoading ? '...' : 'Request Availability'}
          </Button>

          {availStatus && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
              <Chip label={`${availStatus.submitted} submitted`} size="small" sx={{ fontSize: 11, bgcolor: '#DCFCE7', color: '#065F46', fontWeight: 600 }} />
              <Chip label={`${availStatus.pending} pending`} size="small" sx={{ fontSize: 11, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
            </Box>
          )}
        </Box>
      )}

      {/* ── Schedule table ─────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loadingSchedule ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell sx={{ ...headCellSx, width: 36, ...stickyHeadSx(0) }}>#</TableCell>
                  <TableCell sx={{ ...headCellSx, minWidth: 130, ...stickyHeadSx(36) }}>Name</TableCell>
                  <TableCell sx={{ ...headCellSx, minWidth: 90, ...stickyHeadSx(166) }}>Transporter ID</TableCell>
                  {week.days.map((day, i) => (
                    <TableCell key={day} align="center" sx={{ ...headCellSx, minWidth: 60 }}>
                      {DAY_LABELS[i]}<br />
                      <span style={{ fontWeight: 400, fontSize: 10 }}>{formatShortDate(day)}</span>
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ ...headCellSx, minWidth: 44 }}>Total</TableCell>
                  <TableCell align="center" sx={{ ...headCellSx, minWidth: 55 }}>Support</TableCell>
                  <TableCell align="center" sx={{ ...headCellSx, minWidth: 55 }}>Other</TableCell>
                  <TableCell align="center" sx={{ ...headCellSx, minWidth: 60 }}>Notes</TableCell>
                </TableRow>

                {/* ── Filter row ──────────────────────────────────── */}
                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                  <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(0), bgcolor: '#FAFAFA' }} />
                  <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(36), bgcolor: '#FAFAFA' }}>
                    <input value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} placeholder="Filter..." style={filterInputSx} />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(166), bgcolor: '#FAFAFA' }}>
                    <input value={idFilter} onChange={(e) => setIdFilter(e.target.value)} placeholder="Filter..." style={filterInputSx} />
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
                  <TableCell sx={{ ...cellSx, p: 0.5 }} />
                  <TableCell sx={{ ...cellSx, p: 0.5 }} />
                  <TableCell sx={{ ...cellSx, p: 0.5 }} />
                  <TableCell sx={{ ...cellSx, p: 0.5 }} />
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredDrivers.map((driver, idx) => {
                  const entry = scheduleMap[driver.id];
                  const shifts = entry ? entry.shifts : Array(7).fill('');
                  const total = entry?._transferred_in
                    ? Object.values(entry._transfer_days || {}).filter((t) => WORK_CODES.has(t.assigned_code)).length
                    : countWorkDays(shifts);

                  return (
                    <TableRow key={driver.id} hover sx={{
                      '&:nth-of-type(even)': { bgcolor: '#FAFAFA' },
                      ...(entry?._transferred_in && { bgcolor: '#FFF8E1 !important' }),
                    }}>
                      <TableCell sx={{ ...cellSx, fontWeight: 600, textAlign: 'center', ...stickyCellSx(0, 1) }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell sx={{ ...cellSx, fontWeight: 600, ...stickyCellSx(36) }}>
                        {driver.name}
                        {entry?._transferred_in && (
                          <span style={{
                            marginLeft: 4, fontSize: 9, fontWeight: 700, color: '#E65100',
                            background: '#FFF3E0', padding: '1px 4px', borderRadius: 3,
                            verticalAlign: 'middle',
                          }}>
                            ↗ {driver.depot}
                          </span>
                        )}
                        {availNotes[driver.id]?.notes ? (
                          <Tooltip title={availNotes[driver.id].notes} arrow placement="right">
                            <span style={{ marginLeft: 4, cursor: 'help', fontSize: 12, opacity: 0.6 }}>💬</span>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                      <TableCell sx={{ ...cellSx, fontSize: 10, color: 'text.secondary', ...stickyCellSx(166) }}>
                        {driver.amazonId}
                      </TableCell>

                      {shifts.map((code, d) => {
                        const isEditing = editTarget?.driverId === driver.id && editTarget?.dayIndex === d;
                        const dayCol = DAY_COLS[d];
                        const isTransferDay = entry?._transferred_in && entry._transfer_days?.[dayCol];
                        const isNonTransferDay = entry?._transferred_in && !isTransferDay;
                        // For transferred-in drivers on their transfer day, show assigned_code
                        const displayCode = isTransferDay ? (entry._transfer_days[dayCol].assigned_code || '') : code;
                        // For outgoing transfers, show station code as chip but track assigned_code for Excel
                        return (
                          <TableCell
                            key={d}
                            align="center"
                            sx={{
                              ...cellSx,
                              cursor: isNonTransferDay ? 'default' : 'pointer',
                              '&:hover': isNonTransferDay ? {} : { bgcolor: '#F0F0F0' },
                              p: 0.25,
                              ...(isNonTransferDay && { bgcolor: '#F5F5F5', opacity: 0.3 }),
                              ...(isTransferDay && { bgcolor: '#FFF8E1' }),
                            }}
                            onClick={() => !isEditing && !isNonTransferDay && handleCellClick(driver.id, d, displayCode)}
                          >
                            {isEditing ? (
                              <ClickAwayListener onClickAway={handleEditCommit}>
                                <input
                                  ref={editRef}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                  onKeyDown={handleEditKeyDown}
                                  style={{
                                    width: 40, height: 22, border: '1.5px solid #2E4C1E', borderRadius: 4,
                                    textAlign: 'center', fontSize: 11, fontWeight: 600, outline: 'none', padding: 0, fontFamily: 'inherit',
                                  }}
                                />
                              </ClickAwayListener>
                            ) : isNonTransferDay ? (
                              <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                            ) : displayCode ? (
                              <ShiftChip code={displayCode} />
                            ) : (
                              <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                            )}
                          </TableCell>
                        );
                      })}

                      <TableCell align="center" sx={{ ...cellSx, fontWeight: 700, fontSize: 12 }}>{total}</TableCell>

                      {/* Support cell */}
                      {(() => {
                        const val = entry?.support || '';
                        const isEditing = extraEditTarget?.driverId === driver.id && extraEditTarget?.field === 'support';
                        return (
                          <TableCell
                            align="center"
                            sx={{ ...cellSx, cursor: 'pointer', '&:hover': { bgcolor: '#F0F0F0' }, p: 0.25 }}
                            onClick={() => !isEditing && handleExtraClick(driver.id, 'support', val)}
                          >
                            {isEditing ? (
                              <ClickAwayListener onClickAway={handleExtraCommit}>
                                <input
                                  ref={extraEditRef}
                                  value={extraEditValue}
                                  onChange={(e) => setExtraEditValue(e.target.value.toUpperCase())}
                                  onKeyDown={handleExtraKeyDown}
                                  style={{
                                    width: 40, height: 22, border: '1.5px solid #2E4C1E', borderRadius: 4,
                                    textAlign: 'center', fontSize: 11, fontWeight: 600, outline: 'none', padding: 0, fontFamily: 'inherit',
                                  }}
                                />
                              </ClickAwayListener>
                            ) : val ? (
                              customCodes[val] ? <ShiftChip code={val} /> : <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{val}</Typography>
                            ) : (
                              <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                            )}
                          </TableCell>
                        );
                      })()}

                      {/* Other cell */}
                      {(() => {
                        const val = entry?.other || '';
                        const isEditing = extraEditTarget?.driverId === driver.id && extraEditTarget?.field === 'other';
                        return (
                          <TableCell
                            align="center"
                            sx={{ ...cellSx, cursor: 'pointer', '&:hover': { bgcolor: '#F0F0F0' }, p: 0.25 }}
                            onClick={() => !isEditing && handleExtraClick(driver.id, 'other', val)}
                          >
                            {isEditing ? (
                              <ClickAwayListener onClickAway={handleExtraCommit}>
                                <input
                                  ref={extraEditRef}
                                  value={extraEditValue}
                                  onChange={(e) => setExtraEditValue(e.target.value.toUpperCase())}
                                  onKeyDown={handleExtraKeyDown}
                                  style={{
                                    width: 40, height: 22, border: '1.5px solid #2E4C1E', borderRadius: 4,
                                    textAlign: 'center', fontSize: 11, fontWeight: 600, outline: 'none', padding: 0, fontFamily: 'inherit',
                                  }}
                                />
                              </ClickAwayListener>
                            ) : val ? (
                              customCodes[val] ? <ShiftChip code={val} /> : <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{val}</Typography>
                            ) : (
                              <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                            )}
                          </TableCell>
                        );
                      })()}

                      {/* Notes cell */}
                      <TableCell
                        align="center"
                        sx={{ ...cellSx, cursor: 'pointer', '&:hover': { bgcolor: '#F0F0F0' }, p: 0.25, maxWidth: 80 }}
                        onClick={() => handleNotesOpen(driver.id)}
                      >
                        {entry?.notes ? (
                          <Tooltip title={entry.notes} arrow>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>
                              <NotesIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.3 }} />
                              {entry.notes.length > 12 ? entry.notes.slice(0, 12) + '...' : entry.notes}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredDrivers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: 13 }}>
                      No drivers match the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* ── Legend with add/remove ─────────────────────────────── */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
        {Object.keys(customCodes).map((code) => (
          <Box
            key={code}
            sx={{
              position: 'relative',
              display: 'inline-flex',
              '& .chip-remove': { opacity: 0, transition: 'opacity 0.15s' },
              '&:hover .chip-remove': { opacity: 1 },
            }}
          >
            <ShiftChip code={code} />
            <IconButton
              className="chip-remove"
              size="small"
              onClick={() => setCustomCodes((prev) => {
                const next = { ...prev };
                delete next[code];
                return next;
              })}
              sx={{
                position: 'absolute',
                top: -6,
                right: -6,
                p: 0,
                width: 16,
                height: 16,
                bgcolor: '#D32F2F',
                color: 'white',
                '&:hover': { bgcolor: '#B71C1C' },
              }}
            >
              <CloseIcon sx={{ fontSize: 10 }} />
            </IconButton>
          </Box>
        ))}
        <IconButton
          size="small"
          onClick={() => { setAddChipOpen(true); setNewChip({ code: '', color: '#333333', bg: '#F5F5F5' }); }}
          sx={{ width: 28, height: 28, border: '1px dashed #BDBDBD', borderRadius: 1, '&:hover': { bgcolor: '#F5F5F5' } }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* ── Notes Dialog ─────────────────────────────────────────── */}
      <Dialog open={Boolean(notesTarget)} onClose={() => setNotesTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Driver Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add notes for this driver..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesTarget(null)} size="small">Cancel</Button>
          <Button onClick={handleNotesSave} variant="contained" size="small">Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Chip Dialog ──────────────────────────────────────── */}
      <Dialog open={addChipOpen} onClose={() => setAddChipOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Add Shift Code</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '12px !important' }}>
          <TextField
            size="small"
            label="Code"
            placeholder="e.g. TR"
            value={newChip.code}
            onChange={(e) => setNewChip((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
          />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              size="small"
              label="Text Color"
              type="color"
              value={newChip.color}
              onChange={(e) => setNewChip((p) => ({ ...p, color: e.target.value }))}
              sx={{ flex: 1 }}
              InputProps={{ sx: { height: 40 } }}
            />
            <TextField
              size="small"
              label="Background"
              type="color"
              value={newChip.bg}
              onChange={(e) => setNewChip((p) => ({ ...p, bg: e.target.value }))}
              sx={{ flex: 1 }}
              InputProps={{ sx: { height: 40 } }}
            />
          </Box>
          {newChip.code && (
            <Box sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Preview:</Typography>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 32, height: 22, padding: '0 6px', borderRadius: 4,
                fontSize: 11, fontWeight: 600, lineHeight: 1,
                color: newChip.color, backgroundColor: newChip.bg,
                border: `1px solid ${newChip.color}30`,
              }}>
                {newChip.code}
              </span>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddChipOpen(false)} size="small">Cancel</Button>
          <Button
            onClick={() => {
              if (newChip.code) {
                setCustomCodes((prev) => ({
                  ...prev,
                  [newChip.code]: { color: newChip.color, bg: newChip.bg },
                }));
                setAddChipOpen(false);
              }
            }}
            variant="contained"
            size="small"
            disabled={!newChip.code.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

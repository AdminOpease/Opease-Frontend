// src/pages/Admin/WorkingHours.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, IconButton, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import * as XLSX from 'xlsx';
import { useAppStore } from '../../state/AppStore.jsx';
import { workingHours as whApi } from '../../services/api';

const ALL = 'All Depots';

function pad(n) {
  return String(n).padStart(2, '0');
}

function diffHHmmFromTimes(dateStr, startHHMM, endHHMM) {
  if (!startHHMM || !endHHMM) return '';
  const start = new Date(`${dateStr}T${startHHMM}`);
  let end = new Date(`${dateStr}T${endHHMM}`);
  let ms = end - start;
  if (ms < 0) {
    end = new Date(new Date(`${dateStr}T${endHHMM}`).getTime() + 24 * 3600000);
    ms = end - start;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${pad(h)}:${pad(m)}`;
}

// Convert minutes (number or string) to HH:MM
function minsToHHMM(val) {
  if (val === 'Missing' || val === '' || val == null) return '00:00';
  const mins = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(mins)) return '00:00';
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

export default function WorkingHours() {
  const { depots } = useAppStore();
  const depotOptions = [ALL, ...depots];
  const [depot, setDepot] = React.useState('DLU2');
  const [rows, setRows] = React.useState([]);
  const fileInputRef = React.useRef(null);

  // Notes dialog
  const [notesTarget, setNotesTarget] = React.useState(null); // row id
  const [notesValue, setNotesValue] = React.useState('');

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);
  const [workDate, setWorkDate] = React.useState(todayStr);

  const [depotEl, setDepotEl] = React.useState(null);

  const pageSx = { mt: -10 };
  const card = {
    borderRadius: 2, border: '1px solid', borderColor: 'divider',
    height: 44, display: 'flex', alignItems: 'center',
  };
  const th = { fontWeight: 700 };
  const depotBtnSx = {
    borderRadius: 9999, px: 2, minHeight: 34,
    border: '1px solid', borderColor: 'rgba(46,76,30,0.35)',
    color: 'primary.main', fontWeight: 700,
    '&:hover': { borderColor: 'primary.main', backgroundColor: 'transparent' },
  };
  const menuPaperSx = {
    mt: 0.5, minWidth: 200, borderRadius: 2,
    border: '1px solid', borderColor: 'divider',
    boxShadow: '0 6px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
  };

  // Map API row to frontend row
  const mapApiRow = (r) => ({
    id: r.id,
    driver: r.first_name ? `${r.first_name} ${r.last_name}` : '',
    driverId: r.driver_id || null,
    transporterId: r.transporter_id || '',
    routeNumber: r.route_number || '',
    startTime: r.start_time || '',
    finishTime: r.finish_time || '',
    totalWorkTime: diffHHmmFromTimes(workDate, r.start_time || '', r.finish_time || ''),
    breaks: r.breaks || '',
    stops: r.stops != null ? String(r.stops) : '',
    comments: r.comments || '',
  });

  // Fetch from API on date/depot change
  const fetchData = React.useCallback(async () => {
    try {
      const params = { date: workDate };
      if (depot !== ALL) params.depot = depot;
      const res = await whApi.list(params);
      setRows((res.data || []).map(mapApiRow));
    } catch (err) {
      console.error('Failed to fetch working hours:', err);
    }
  }, [workDate, depot]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const addRow = async () => {
    try {
      const entry = await whApi.create({
        work_date: workDate,
        depot: depot !== ALL ? depot : '',
      });
      setRows((prev) => [...prev, mapApiRow(entry)]);
    } catch (err) {
      console.error('Failed to add row:', err);
    }
  };

  // Debounce timer ref for persisting edits
  const saveTimers = React.useRef({});

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    // Debounce persist to API (500ms)
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(() => {
      // Build API payload from patch
      const apiPatch = {};
      if ('routeNumber' in patch) apiPatch.route_number = patch.routeNumber;
      if ('startTime' in patch) apiPatch.start_time = patch.startTime || null;
      if ('finishTime' in patch) apiPatch.finish_time = patch.finishTime || null;
      if ('breaks' in patch) apiPatch.breaks = patch.breaks;
      if ('stops' in patch) apiPatch.stops = patch.stops ? parseInt(patch.stops, 10) || null : null;
      if ('comments' in patch) apiPatch.comments = patch.comments;
      if ('driver' in patch) apiPatch.vehicle = undefined; // driver name not directly editable in API

      // Only send valid fields
      const cleaned = {};
      for (const [k, v] of Object.entries(apiPatch)) {
        if (v !== undefined) cleaned[k] = v;
      }
      if (Object.keys(cleaned).length > 0) {
        whApi.update(id, cleaned).catch((err) => console.error('Failed to save:', err));
      }
    }, 500);
  };

  // No longer need to recompute on date change since fetchData handles it
  React.useEffect(() => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        totalWorkTime: diffHHmmFromTimes(workDate, r.startTime, r.finishTime),
      }))
    );
  }, [workDate]);

  // Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        const headers = Object.keys(data[0] || {});
        const tidCol = headers.find((h) => /transporter/i.test(h));
        const nameCol = headers.find((h) => /driver.*name/i.test(h) || /^name$/i.test(h));
        const routeCol = headers.find((h) => /route.*code/i.test(h));
        const signInCol = headers.find((h) => /app.*sign.*in/i.test(h));
        const returnCol = headers.find((h) => /projected.*return/i.test(h));
        const breakCol = headers.find((h) => /cortex.*break/i.test(h));
        const stopsCol = headers.find((h) => /^all.*stops$/i.test(h) || /^stops$/i.test(h));

        const newRows = data.map((r, i) => {
          // Route code: take first one before |
          const rawRoute = routeCol ? String(r[routeCol] || '') : '';
          const route = rawRoute.split('|')[0].trim();

          // Driver name
          const rawName = nameCol ? String(r[nameCol] || '') : '';
          // Name may be "Last,First" — convert to "First Last"
          const driver = rawName.includes(',')
            ? rawName.split(',').reverse().map((s) => s.trim()).join(' ')
            : rawName;

          const transporterId = tidCol ? String(r[tidCol] || '') : '';

          // Times — may be "HH:MM" already or a decimal
          let startTime = signInCol ? String(r[signInCol] || '') : '';
          let finishTime = returnCol ? String(r[returnCol] || '') : '';
          if (startTime === 'Missing') startTime = '';
          if (finishTime === 'Missing') finishTime = '';
          // Handle decimal time (Excel serial) → HH:MM
          if (startTime && !startTime.includes(':')) {
            const num = parseFloat(startTime);
            if (!isNaN(num) && num < 1) {
              const mins = Math.round(num * 24 * 60);
              startTime = `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
            }
          }
          if (finishTime && !finishTime.includes(':')) {
            const num = parseFloat(finishTime);
            if (!isNaN(num) && num < 1) {
              const mins = Math.round(num * 24 * 60);
              finishTime = `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
            }
          }

          const totalWorkTime = diffHHmmFromTimes(workDate, startTime, finishTime);

          // Breaks
          const rawBreak = breakCol ? r[breakCol] : '';
          const breaks = (rawBreak === 'Missing' || rawBreak === '') ? '00:00' : minsToHHMM(rawBreak);

          const stops = stopsCol ? String(r[stopsCol] || '') : '';

          return {
            driver_name: driver,
            route_number: route,
            start_time: startTime,
            finish_time: finishTime,
            breaks,
            stops: stops ? parseInt(stops, 10) || null : null,
            comments: '',
          };
        });

        // Send to backend import API
        const currentDepot = depot !== ALL ? depot : '';
        await whApi.importData({ work_date: workDate, depot: currentDepot, rows: newRows });
        // Refetch to get persisted data with IDs and driver matches
        await fetchData();
      } catch (err) {
        alert('Failed to import file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Notes dialog handlers
  const handleNotesOpen = (rowId) => {
    const row = rows.find((r) => r.id === rowId);
    setNotesTarget(rowId);
    setNotesValue(row?.comments || '');
  };

  const handleNotesSave = () => {
    if (notesTarget) {
      updateRow(notesTarget, { comments: notesValue });
    }
    setNotesTarget(null);
  };

  return (
    <Box sx={pageSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Paper variant="outlined" sx={{ ...card, px: 1.25 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="date"
              label="Date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 165 }}
            />
            <Button size="small" variant="contained" onClick={addRow}>Add Row</Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload (.xlsx / .csv)
            </Button>
          </Stack>
        </Paper>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={(e) => setDepotEl(e.currentTarget)} sx={depotBtnSx}>
          <Typography component="span" sx={{ mr: 1, fontWeight: 700, fontSize: 14 }}>
            {depot}
          </Typography>
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={depotEl}
          open={Boolean(depotEl)}
          onClose={() => setDepotEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          PaperProps={{ sx: menuPaperSx }}
          MenuListProps={{ dense: true, sx: { py: 0 } }}
        >
          {depotOptions.map((d) => (
            <MenuItem
              key={d}
              onClick={() => { setDepot(d); setDepotEl(null); }}
              sx={{ justifyContent: 'center', textAlign: 'center', px: 2, py: 0.9, fontSize: 14 }}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table
            size="small"
            sx={{
              '& th, & td': { px: 1.5 },
              '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
              '& thead th:last-of-type,  & tbody td:last-of-type': { pr: 3 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={th}>Driver</TableCell>
                <TableCell sx={th}>Transporter ID</TableCell>
                <TableCell sx={th}>Route Number</TableCell>
                <TableCell sx={th}>Start Time</TableCell>
                <TableCell sx={th}>Finish Time</TableCell>
                <TableCell sx={th}>Total Work Time</TableCell>
                <TableCell sx={th}>Breaks</TableCell>
                <TableCell sx={th}>Stops</TableCell>
                <TableCell sx={th}>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                // Flag: no/invalid finish time OR total work time > 10 hours OR NaN in total
                const hasValidFinish = r.finishTime && /^\d{1,2}:\d{2}$/.test(r.finishTime);
                const totalHasNaN = !r.totalWorkTime || r.totalWorkTime.includes('NaN') || r.totalWorkTime === '';
                const over10 = (() => {
                  if (!r.totalWorkTime || !r.totalWorkTime.includes(':')) return false;
                  const [h, m] = r.totalWorkTime.split(':').map(Number);
                  if (isNaN(h) || isNaN(m)) return false;
                  return (h > 10 || (h === 10 && m > 0));
                })();
                const needsReview = !hasValidFinish || totalHasNaN || over10;

                return (
                <TableRow key={r.id} hover sx={needsReview ? { bgcolor: '#FFEBEE !important', '&:hover': { bgcolor: '#FFCDD2 !important' } } : {}}>
                  <TableCell sx={{ minWidth: 160 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={r.driver}
                      onChange={(e) => updateRow(r.id, { driver: e.target.value })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 140, fontSize: 11, color: 'text.secondary', fontFamily: 'monospace' }}>
                    {r.transporterId || ''}
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={r.routeNumber}
                      onChange={(e) => updateRow(r.id, { routeNumber: e.target.value })}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField
                      size="small"
                      type="time"
                      value={r.startTime}
                      onChange={(e) => {
                        const startTime = e.target.value;
                        const totalWorkTime = diffHHmmFromTimes(workDate, startTime, r.finishTime);
                        updateRow(r.id, { startTime, totalWorkTime });
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <TextField
                      size="small"
                      type="time"
                      value={r.finishTime}
                      onChange={(e) => {
                        const finishTime = e.target.value;
                        const totalWorkTime = diffHHmmFromTimes(workDate, r.startTime, finishTime);
                        updateRow(r.id, { finishTime, totalWorkTime });
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, fontWeight: 700 }}>
                    {r.totalWorkTime}
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    <TextField
                      size="small"
                      value={r.breaks}
                      onChange={(e) => updateRow(r.id, { breaks: e.target.value })}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField
                      size="small"
                      value={r.stops}
                      onChange={(e) => updateRow(r.id, { stops: e.target.value })}
                      sx={{ width: 60 }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{ minWidth: 80, cursor: 'pointer', '&:hover': { bgcolor: '#F5F5F5' } }}
                    onClick={() => handleNotesOpen(r.id)}
                  >
                    {r.comments ? (
                      <Tooltip title={r.comments} arrow>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                          <StickyNote2Icon sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.3 }} />
                          {r.comments.length > 15 ? r.comments.slice(0, 15) + '...' : r.comments}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                        <StickyNote2Icon sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.3 }} /> Add
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    No rows yet. Use "Add Row" or "Upload" a file.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Comments/Notes Dialog */}
      <Dialog open={Boolean(notesTarget)} onClose={() => setNotesTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Comments</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            maxRows={10}
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add comments..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesTarget(null)} size="small">Cancel</Button>
          <Button onClick={handleNotesSave} variant="contained" size="small">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

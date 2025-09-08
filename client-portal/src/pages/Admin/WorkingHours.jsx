// src/pages/Admin/WorkingHours.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, IconButton, Menu, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DEPOTS = ['All Depots', 'Heathrow', 'Greenwich', 'Battersea'];

const INITIAL_ROWS = [
  // demo row (time-only)
  {
    id: 'r-1',
    driver: 'Amy Jones',
    vehicle: 'VN21 ABC',
    routeNumber: 'R12',
    startTime: '08:00',     // HH:MM
    finishTime: '16:00',    // HH:MM
    totalWorkTime: '08:00',
    breaks: '00:30',
    stops: 42,
    comments: '—',
  },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Compute HH:MM difference from time-only strings using a date anchor. Rolls over midnight if needed.
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

export default function WorkingHours() {
  const [depot, setDepot] = React.useState('All Depots');
  const [rows, setRows] = React.useState(INITIAL_ROWS);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadFileName, setUploadFileName] = React.useState('');

  // default today's date (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);
  const [workDate, setWorkDate] = React.useState(todayStr);

  // Depot pill menu state (match Drivers page)
  const [depotEl, setDepotEl] = React.useState(null);

  // ---- styles (aligned with Drivers) ----
  const pageSx = { mt: -10 };
  const card = {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    height: 44,
    display: 'flex',
    alignItems: 'center'
  };
  const th = { fontWeight: 700 };

  const depotBtnSx = {
    borderRadius: 9999,
    px: 2,
    minHeight: 34,
    border: '1px solid',
    borderColor: 'rgba(46,76,30,0.35)',
    color: 'primary.main',
    fontWeight: 700,
    '&:hover': { borderColor: 'primary.main', backgroundColor: 'transparent' },
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
  };

  const addRow = () => {
    const id = `r-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        id,
        driver: '',
        vehicle: '',
        routeNumber: '',
        startTime: '',
        finishTime: '',
        totalWorkTime: '',
        breaks: '',
        stops: '',
        comments: '',
      },
    ]);
  };

  const updateRow = (id, patch) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  // Recompute totals when the anchor date changes
  React.useEffect(() => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        totalWorkTime: diffHHmmFromTimes(workDate, r.startTime, r.finishTime),
      }))
    );
  }, [workDate]);

  return (
    <Box sx={pageSx}>
      {/* Toolbar row: left = white card with Date + actions; right = Depot pill */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {/* LEFT: white rounded container */}
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
            <Button
              size="small"
              variant="outlined"
              onClick={() => setUploadOpen(true)}
            >
              Upload (.xlsx / .csv)
            </Button>
          </Stack>
        </Paper>

        {/* spacer to push Depot to the far right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* RIGHT: Depot pill (outside the white container) */}
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
          MenuListProps={{ dense: true, sx: menuListSx }}
        >
          {DEPOTS.map((d) => (
            <MenuItem
              key={d}
              onClick={() => { setDepot(d); setDepotEl(null); }}
              sx={navLikeItemSx}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Table styled like Drivers page */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          size="small"
          sx={{
            '& th, & td': { px: 1.5 },
            '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
            '& thead th:last-of-type,  & tbody td:last-of-type':  { pr: 3 },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={th}>Driver</TableCell>
              <TableCell sx={th}>Vehicle</TableCell>
              <TableCell sx={th}>Route number</TableCell>
              <TableCell sx={th}>Start time</TableCell>
              <TableCell sx={th}>Finish time</TableCell>
              <TableCell sx={th}>Total work time</TableCell>
              <TableCell sx={th}>Breaks</TableCell>
              <TableCell sx={th}>Stops</TableCell>
              <TableCell sx={th}>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ minWidth: 160 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={r.driver}
                    onChange={(e) => updateRow(r.id, { driver: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={r.vehicle}
                    onChange={(e) => updateRow(r.id, { vehicle: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={r.routeNumber}
                    onChange={(e) => updateRow(r.id, { routeNumber: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <TextField
                    size="small"
                    type="time"
                    value={r.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value; // HH:MM
                      const totalWorkTime = diffHHmmFromTimes(workDate, startTime, r.finishTime);
                      updateRow(r.id, { startTime, totalWorkTime });
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <TextField
                    size="small"
                    type="time"
                    value={r.finishTime}
                    onChange={(e) => {
                      const finishTime = e.target.value; // HH:MM
                      const totalWorkTime = diffHHmmFromTimes(workDate, r.startTime, finishTime);
                      updateRow(r.id, { finishTime, totalWorkTime });
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 120, fontWeight: 700 }}>
                  {r.totalWorkTime}
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  <TextField
                    size="small"
                    value={r.breaks}
                    onChange={(e) => updateRow(r.id, { breaks: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  <TextField
                    size="small"
                    value={r.stops}
                    onChange={(e) => updateRow(r.id, { stops: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 180 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={r.comments}
                    onChange={(e) => updateRow(r.id, { comments: e.target.value })}
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  No rows yet. Use “Add Row” or “Upload”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {uploadOpen && (
        <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload timesheet</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button size="small" variant="outlined" component="label">
              Choose File
              <input hidden type="file" accept=".xlsx,.csv" onChange={(e) => {
                const f = e.target.files?.[0];
                setUploadFileName(f ? f.name : '');
              }} />
            </Button>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {uploadFileName || 'No file selected'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Button size="small" variant="text" onClick={() => { setUploadOpen(false); setUploadFileName(''); }}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  const id = `r-${Date.now()}`;
                  setRows(prev => [...prev, {
                    id,
                    driver: 'Imported Driver',
                    vehicle: 'VN25 XYZ',
                    routeNumber: 'R99',
                    startTime: '08:00',
                    finishTime: '16:00',
                    totalWorkTime: '08:00',
                    breaks: '00:30',
                    stops: 35,
                    comments: 'Imported',
                  }]);
                  setUploadOpen(false);
                  setUploadFileName('');
                }}
                disabled={!uploadFileName}
              >
                Import
              </Button>
            </Stack>
          </Stack>
          <Typography sx={{ mt: 1, fontSize: 11, color: 'text.secondary' }}>
            Note: We’ll add a header-mapping step so your columns don’t need to match exactly.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// src/pages/Admin/WorkingHours.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const DEPOTS = ['All Depots', 'Heathrow', 'Greenwich', 'Battersea'];

const INITIAL_ROWS = [
  // demo row
  {
    id: 'r-1',
    driver: 'Amy Jones',
    vehicle: 'VN21 ABC',
    routeNumber: 'R102',
    startTime: '2025-08-29T08:00',
    finishTime: '2025-08-29T17:00',
    totalWorkTime: '09:00', // finish - start (ignore breaks)
    breaks: '',
    stops: '143',
    comments: '',
  },
];

function diffHHmm(startISO, finishISO) {
  if (!startISO || !finishISO) return '';
  const start = new Date(startISO);
  const finish = new Date(finishISO);
  const ms = Math.max(0, finish - start);
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

export default function WorkingHours() {
  const [depot, setDepot] = React.useState('All Depots');
  const [rows, setRows] = React.useState(INITIAL_ROWS);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadFileName, setUploadFileName] = React.useState('');

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

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Admin & Compliance — Working Hours</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="depot-label">Depot</InputLabel>
          <Select
            labelId="depot-label"
            label="Depot"
            value={depot}
            onChange={(e) => setDepot(e.target.value)}
          >
            {DEPOTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Paper sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
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

      <Paper>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Driver</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Route number</TableCell>
              <TableCell>Start time</TableCell>
              <TableCell>Finish time</TableCell>
              <TableCell>Total work time</TableCell>
              <TableCell>Breaks</TableCell>
              <TableCell>Stops</TableCell>
              <TableCell>Comments</TableCell>
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
                <TableCell sx={{ minWidth: 120 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={r.routeNumber}
                    onChange={(e) => updateRow(r.id, { routeNumber: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 170 }}>
                  <TextField
                    size="small"
                    type="datetime-local"
                    value={r.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      const totalWorkTime = diffHHmm(startTime, r.finishTime);
                      updateRow(r.id, { startTime, totalWorkTime });
                    }}
                    helperText="Europe/London"
                    InputLabelProps={{ shrink: true }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 170 }}>
                  <TextField
                    size="small"
                    type="datetime-local"
                    value={r.finishTime}
                    onChange={(e) => {
                      const finishTime = e.target.value;
                      const totalWorkTime = diffHHmm(r.startTime, finishTime);
                      updateRow(r.id, { finishTime, totalWorkTime });
                    }}
                    helperText="Europe/London"
                    InputLabelProps={{ shrink: true }}
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
                    placeholder="mins"
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField
                    size="small"
                    value={r.stops}
                    onChange={(e) => updateRow(r.id, { stops: e.target.value })}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 200 }}>
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

      {/* Simple upload stub (no parsing yet; mapping will come later) */}
      {uploadOpen && (
        <Box sx={{ mt: 2, p: 2, border: '1px dashed #D9D9D9', borderRadius: 1, background: '#FAFAFA' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <Button component="label" size="small" variant="outlined">
              Choose file
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setUploadFileName(f ? f.name : '');
                }}
              />
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
                  // Placeholder: in a later step we’ll add a mapping flow + parsing.
                  // For now, just inject a demo row to simulate import.
                  const id = `r-${Date.now()}`;
                  setRows(prev => [
                    ...prev,
                    {
                      id,
                      driver: 'Imported Driver',
                      vehicle: 'IMP-123',
                      routeNumber: 'R-IMP',
                      startTime: '',
                      finishTime: '',
                      totalWorkTime: '',
                      breaks: '',
                      stops: '',
                      comments: `Imported from ${uploadFileName || 'file'}`,
                    },
                  ]);
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

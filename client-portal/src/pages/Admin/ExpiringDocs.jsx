// src/pages/Admin/ExpiringDocs.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, Button, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';
const DOC_TYPES = ['All', 'Right to Work', 'DVLA', 'Licence'];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function inWindow(doc) {
  const days = daysUntil(doc.expiryDate);
  if (days == null) return false;
  if (doc.type === 'DVLA') return days <= 7;
  return days <= 30; // Licence & RTW
}

export default function ExpiringDocs() {
  const { depots, documents } = useAppStore();
  const depotOptions = [ALL, ...depots];

  const [depot, setDepot] = React.useState(ALL);
  const [docType, setDocType] = React.useState('All');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [onlyWindow, setOnlyWindow] = React.useState(true); // show only within thresholds by default

  const filtered = React.useMemo(() => {
    let rows = documents
      .filter((d) => !d.deletedAt) // hide recycled
      .map((d) => ({
        id: d.id,
        driverName: d.driverName,
        driverEmail: d.driverEmail,
        depot: d.depot,
        type: d.type,
        expiryDate: d.expiryDate || null,
      }));

    if (depot !== ALL) rows = rows.filter((r) => r.depot === depot);
    if (docType !== 'All') rows = rows.filter((r) => r.type === docType);
    if (dateFrom) rows = rows.filter((r) => !r.expiryDate || r.expiryDate >= dateFrom);
    if (dateTo) rows = rows.filter((r) => !r.expiryDate || r.expiryDate <= dateTo);
    if (onlyWindow) rows = rows.filter(inWindow);

    return rows
      .map((r) => ({ ...r, daysLeft: daysUntil(r.expiryDate) }))
      .sort((a, b) => (a.daysLeft ?? 99999) - (b.daysLeft ?? 99999));
  }, [documents, depot, docType, dateFrom, dateTo, onlyWindow]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Admin & Compliance — Expiring Documents</Typography>

      <Paper sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="depot-label">Depot</InputLabel>
            <Select
              labelId="depot-label"
              label="Depot"
              value={depot}
              onChange={(e) => setDepot(e.target.value)}
            >
              {depotOptions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="doctype-label">Document Type</InputLabel>
            <Select
              labelId="doctype-label"
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              {DOC_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />

          <Chip
            label={onlyWindow ? 'Expiring Window' : 'All'}
            onClick={() => setOnlyWindow((v) => !v)}
            size="small"
            variant={onlyWindow ? 'filled' : 'outlined'}
            color={onlyWindow ? 'primary' : 'default'}
            sx={{ height: 24, fontSize: 11 }}
          />

          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Button size="small" variant="outlined" onClick={() => { /* TODO: export CSV */ }}>
              Export CSV
            </Button>
            <Button size="small" variant="contained" onClick={() => { /* TODO: send reminders */ }}>
              Send Reminders
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Driver</TableCell>
              <TableCell>Email (ID)</TableCell>
              <TableCell>Depot</TableCell>
              <TableCell>Doc Type</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Days Left</TableCell>
              <TableCell>Window</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  No documents match your filters.
                </TableCell>
              </TableRow>
            )}

            {filtered.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ minWidth: 180 }}>{r.driverName}</TableCell>
                <TableCell>{r.driverEmail}</TableCell>
                <TableCell>{r.depot}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.expiryDate || '—'}</TableCell>
                <TableCell>{r.daysLeft ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={r.type === 'DVLA' ? '≤ 7 days' : '≤ 30 days'}
                    sx={{ fontSize: 11, height: 22, borderRadius: 999 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

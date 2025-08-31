// src/pages/Admin/Dashboard.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableHead, TableRow, TableCell, Chip
} from '@mui/material';
import StatusChip from '../../components/common/StatusChip';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function isExpiringSoon(doc) {
  const days = daysUntil(doc.expiryDate);
  if (days == null) return false;
  if (doc.type === 'DVLA') return days <= 7; // DVLA: 7-day window
  return days <= 30;                         // Licence & Right to Work: 30-day window
}

export default function AdminDashboard() {
  const { depots, drivers, documents } = useAppStore();
  const depotOptions = [ALL, ...depots];
  const [depot, setDepot] = React.useState(ALL);

  const filteredDrivers = React.useMemo(() => {
    return depot === ALL ? drivers : drivers.filter(d => d.depot === depot);
  }, [drivers, depot]);

  const activeCount = filteredDrivers.filter(d => d.status === 'Active').length;

  const expiringRows = React.useMemo(() => {
    const rows = (depot === ALL ? documents : documents.filter(x => x.depot === depot))
      .filter(d => !d.deletedAt) // ignore recycled items
      .filter(isExpiringSoon)
      .map(x => ({
        ...x,
        daysLeft: daysUntil(x.expiryDate),
      }))
      .sort((a, b) => (a.daysLeft ?? 99999) - (b.daysLeft ?? 99999));
    return rows;
  }, [documents, depot]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Admin & Compliance — Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="depot-label">Depot</InputLabel>
          <Select
            labelId="depot-label"
            label="Depot"
            value={depot}
            onChange={(e) => setDepot(e.target.value)}
          >
            {depotOptions.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Paper sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
            Active Drivers
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
            {activeCount}
          </Typography>
        </Paper>

        <Paper sx={{ flex: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
            Expiring Documents
          </Typography>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Depot</TableCell>
                <TableCell>Doc Type</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Days Left</TableCell>
                <TableCell>Window</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expiringRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontSize: 12, color: 'text.secondary' }}>
                    No documents within the expiring window.
                  </TableCell>
                </TableRow>
              )}
              {expiringRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ minWidth: 180 }}>{row.driverName}</TableCell>
                  <TableCell>{row.depot}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.expiryDate}</TableCell>
                  <TableCell>{row.daysLeft}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={row.type === 'DVLA' ? '≤ 7 days' : '≤ 30 days'}
                      sx={{ fontSize: 11, height: 22, borderRadius: 999 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      <Paper>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
          Recent Drivers (by depot)
        </Typography>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email (ID)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Depot</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.map((d) => (
              <TableRow key={d.email} hover>
                <TableCell sx={{ minWidth: 180 }}>{d.name}</TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell><StatusChip status={d.status} /></TableCell>
                <TableCell>{d.depot}</TableCell>
              </TableRow>
            ))}
            {filteredDrivers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  No drivers for this depot.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

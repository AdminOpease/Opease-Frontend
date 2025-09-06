// src/pages/Admin/Dashboard.jsx
import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Chip,
  Divider,
} from '@mui/material';
import StatusChip from '../../components/common/StatusChip';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';

// --- helpers ---
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(`${dateStr}T00:00:00`);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function bySoonest(a, b) {
  return daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
}

export default function AdminDashboard() {
  const { drivers = [], documents = [] } = useAppStore();

  const depots = React.useMemo(
    () => [ALL, ...Array.from(new Set(drivers.map((d) => d.depot)))],
    [drivers]
  );
  const [depot, setDepot] = React.useState(ALL);

  const filteredDrivers = React.useMemo(
    () => (depot === ALL ? drivers : drivers.filter((d) => d.depot === depot)),
    [drivers, depot]
  );

  // active drivers (simple example: not Offboarded/Inactive)
  const activeDrivers = filteredDrivers.filter(
    (d) => d.status !== 'Offboarded' && d.status !== 'Inactive'
  );

  // expiring documents (next 30 days, not deleted/archived)
  const expiring = React.useMemo(() => {
    const list = documents.filter(
      (doc) =>
        !doc.deletedAt &&
        !doc.archivedAt &&
        (depot === ALL ||
          drivers.find((d) => d.email === doc.driverEmail)?.depot === depot)
    );
    return list
      .map((doc) => ({ ...doc, _days: daysUntil(doc.expiryDate) }))
      .filter((doc) => doc._days !== null && doc._days <= 30)
      .sort(bySoonest);
  }, [documents, drivers, depot]);

  // recent drivers (just show filtered list for now)
  const recent = filteredDrivers;

  return (
    <Box>
      {/* header row */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin &amp; Compliance — Dashboard
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="depot-label">Depot</InputLabel>
          <Select
            labelId="depot-label"
            label="Depot"
            value={depot}
            onChange={(e) => setDepot(e.target.value)}
          >
            {depots.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* top cards */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 1.5 }}
      >
        {/* KPI: Active Drivers */}
        <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
            Active Drivers
          </Typography>
          <Typography
            component="div"
            sx={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}
          >
            {activeDrivers.length}
          </Typography>
        </Paper>

        {/* Expiring Documents */}
        <Paper variant="outlined" sx={{ flex: 2, p: 0 }}>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Expiring Documents
            </Typography>
          </Box>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Depot</TableCell>
                <TableCell>Doc Type</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell align="right">Days Left</TableCell>
                <TableCell align="center">Window</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expiring.map((doc) => {
                const dLeft = daysUntil(doc.expiryDate);
                const depotOfDriver =
                  drivers.find((d) => d.email === doc.driverEmail)?.depot ||
                  '—';
                const tag =
                  dLeft <= 7 ? '≤ 7 days' : dLeft <= 30 ? '≤ 30 days' : null;

                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.driverName}</TableCell>
                    <TableCell>{depotOfDriver}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.expiryDate}</TableCell>
                    <TableCell align="right">{dLeft}</TableCell>
                    <TableCell align="center">
                      {tag && (
                        <Chip
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 11, height: 22, borderRadius: 2 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {expiring.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{ fontSize: 12, color: 'text.secondary' }}
                  >
                    No documents expiring in the next 30 days.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      {/* recent drivers */}
      <Paper variant="outlined" sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Recent Drivers (by depot)
          </Typography>
        </Box>
        <Divider />
        <Table size="small" stickyHeader={false}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email (ID)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Depot</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recent.map((d) => (
              <TableRow key={d.email}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell>
                  <StatusChip status={d.status} />
                </TableCell>
                <TableCell>{d.depot}</TableCell>
              </TableRow>
            ))}
            {recent.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ fontSize: 12, color: 'text.secondary' }}
                >
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

// src/pages/Admin/Drivers.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link as RouterLink } from 'react-router-dom';
import StatusChip from '../../components/common/StatusChip';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';
const STATUS_FILTERS = ['Active', 'Inactive', 'Offboarded']; // Onboarding always shown unless filtered explicitly

export default function AdminDrivers() {
  const { depots, drivers } = useAppStore();
  const depotOptions = [ALL, ...depots];

  const [depot, setDepot] = React.useState(ALL);
  const [q, setQ] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState([]);

  const toggleStatus = (s) =>
    setSelectedStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const filtered = React.useMemo(() => {
    const lower = q.trim().toLowerCase();

    return drivers
      .filter((d) => depot === ALL || d.depot === depot)
      .filter((d) => {
        if (!lower) return true;
        return (
          d.name.toLowerCase().includes(lower) ||
          d.email.toLowerCase().includes(lower) ||
          d.phone.toLowerCase().includes(lower)
        );
      })
      .filter((d) => {
        if (selectedStatuses.length === 0) return true;
        return selectedStatuses.includes(d.status);
      });
  }, [drivers, depot, q, selectedStatuses]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Admin & Compliance — Drivers</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="depot-label">Depot</InputLabel>
          <Select
            labelId="depot-label"
            label="Depot"
            value={depot}
            onChange={(e) => setDepot(e.target.value)}
          >
            {depotOptions.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Paper sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search name, email, or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant={selectedStatuses.includes(s) ? 'filled' : 'outlined'}
                color={selectedStatuses.includes(s) ? 'primary' : 'default'}
                onClick={() => toggleStatus(s)}
                sx={{ fontSize: 11, height: 24 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email (ID)</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Depot</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  No drivers match your filters.
                </TableCell>
              </TableRow>
            )}

            {filtered.map((d) => (
              <TableRow key={d.email} hover>
                <TableCell sx={{ minWidth: 180 }}>
                  <Button
                    component={RouterLink}
                    to={`/admin/drivers/${encodeURIComponent(d.email)}`}
                    size="small"
                    sx={{ px: 0, textTransform: 'none', fontWeight: 700 }}
                  >
                    {d.name}
                  </Button>
                </TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell>{d.phone}</TableCell>
                <TableCell>
                  <StatusChip status={d.status} />
                </TableCell>
                <TableCell>{d.depot}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" aria-label="actions" onClick={() => { /* stub for now */ }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

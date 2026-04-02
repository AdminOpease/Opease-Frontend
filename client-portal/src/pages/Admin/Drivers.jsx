// src/pages/Admin/Drivers.jsx
import * as React from 'react';
import {
  Box, Paper, Stack, TextField, InputAdornment, Button, Grid,
  Chip, IconButton, Menu, MenuItem, Select, OutlinedInput,
  Table, TableHead, TableBody, TableRow, TableCell, Typography,
  Dialog, DialogContent, DialogActions, Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import StatusChip from '../../components/common/StatusChip';
import { useAppStore } from '../../state/AppStore.jsx';
import { drivers as driversApi } from '../../services/api';

const ALL = 'All Depots';
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Onboarding', 'Offboarded'];
const STATUS_COLORS = {
  Active:      { bg: '#DCFCE7', fg: '#065F46' },
  Inactive:    { bg: '#E5E7EB', fg: '#374151' },
  Onboarding:  { bg: '#FEF3C7', fg: '#92400E' },
  Offboarded:  { bg: '#FEE2E2', fg: '#991B1B' },
};

// Static style objects (extracted to avoid re-creation on every render)
const pageSx = { mt: -10 };
const card = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  height: 44,
  display: 'flex',
  alignItems: 'center'
};
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
const statChip = {
  height: 24,
  borderRadius: 2,
  fontSize: 11,
  borderColor: 'divider',
};
const th = { fontWeight: 700 };
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
const rowMenuPaperSx = {
  mt: 0.5,
  minWidth: 140,
  borderRadius: 1.5,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  overflow: 'hidden',
};
const rowMenuItemSx = {
  justifyContent: 'center',
  textAlign: 'center',
  px: 1.25,
  py: 0.6,
  fontSize: 13,
  lineHeight: 1.2,
  '&:hover': { backgroundColor: 'action.hover' },
};

export default function AdminDrivers() {
  const { drivers = [], setDrivers, fetchDrivers } = useAppStore();

  // Depot (nav-style pill dropdown)
  const { depots: stationCodes } = useAppStore();
  const depots = React.useMemo(
    () => {
      const fromDrivers = drivers.map((d) => d.depot).filter(Boolean);
      const all = Array.from(new Set([...stationCodes, ...fromDrivers])).sort();
      return [ALL, ...all];
    },
    [drivers, stationCodes]
  );
  const [depot, setDepot] = React.useState('DLU2');
  const [depotEl, setDepotEl] = React.useState(null);
  const depotOpen = Boolean(depotEl);

  // Search (centered, compact)
  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);

  // Status filter in header (defaults to Active)
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [statusEl, setStatusEl] = React.useState(null);

  // Derived lists
  const byDepot = React.useMemo(
    () => (depot === ALL ? drivers : drivers.filter((d) => d.depot === depot)),
    [drivers, depot]
  );

  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return byDepot
      .filter((d) =>
        !q
          ? true
          : (d.name || '').toLowerCase().includes(q) ||
            (d.email || '').toLowerCase().includes(q) ||
            (d.phone || '').toLowerCase().includes(q)
      )
      .filter((d) => (statusFilter === 'All' ? true : d.status === statusFilter));
  }, [byDepot, deferredQuery, statusFilter]);

  // Status counts (based on depot)
  const counts = React.useMemo(() => {
    const base = { Active: 0, Inactive: 0, Onboarding: 0, Offboarded: 0 };
    for (const d of byDepot) base[d.status] = (base[d.status] || 0) + 1;
    return base;
  }, [byDepot]);

  // Update driver status via API
  const setStatusFor = async (driverId, newStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: newStatus } : d))
    );
    try { await driversApi.update(driverId, { status: newStatus }); } catch (e) { console.error('Failed to update status:', e); }
  };

  // Update driver depot via API
  const setDepotFor = async (driverId, newDepot) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, depot: newDepot } : d))
    );
    try { await driversApi.update(driverId, { depot: newDepot }); } catch (e) { console.error('Failed to update depot:', e); }
  };

  // Depot options for inline table dropdown (same stations)
  const allDepots = React.useMemo(
    () => stationCodes.length > 0 ? stationCodes : Array.from(new Set(drivers.map((d) => d.depot).filter(Boolean))).sort(),
    [stationCodes, drivers]
  );

  // Add Driver dialog
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState({
    firstName: '', lastName: '', email: '', phone: '', depot: allDepots[0] || '',
    amazonId: '', transporterId: '',
  });
  const [addSubmitting, setAddSubmitting] = React.useState(false);

  const setAdd = (key) => (e) => setAddForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddDriver = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) return;
    try {
      setAddSubmitting(true);
      await driversApi.create({
        first_name: addForm.firstName.trim(),
        last_name: addForm.lastName.trim(),
        email: addForm.email.trim().toLowerCase(),
        phone: addForm.phone.trim(),
        depot: addForm.depot || null,
        status: 'Active',
        amazon_id: addForm.amazonId.trim() || null,
        transporter_id: addForm.transporterId.trim() || null,
      });
      fetchDrivers();
      setAddOpen(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', depot: allDepots[0] || '', amazonId: '', transporterId: '' });
    } catch (err) {
      console.error('Failed to add driver:', err);
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <Box sx={pageSx}>
      {/* top-right buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
          onClick={() => setAddOpen(true)}
          sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700, px: 2 }}
        >
          Add Driver
        </Button>
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
          {depots.map((d) => (
            <MenuItem key={d} onClick={() => { setDepot(d); setDepotEl(null); }} sx={navLikeItemSx}>
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* status counts + search side-by-side, aligned */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
        {/* Counts card */}
        <Paper variant="outlined" sx={{ ...card, px: 1.25 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {['Active', 'Inactive', 'Onboarding', 'Offboarded'].map((s) => (
              <Chip
                key={s}
                label={`${s}: ${counts[s] || 0}`}
                variant={statusFilter === s ? 'filled' : 'outlined'}
                onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                sx={{
                  ...statChip,
                  cursor: 'pointer',
                  ...(statusFilter === s && {
                    bgcolor: STATUS_COLORS[s]?.bg,
                    color: STATUS_COLORS[s]?.fg,
                    borderColor: STATUS_COLORS[s]?.fg,
                  }),
                }}
              />
            ))}
          </Stack>
        </Paper>

        {/* Search card */}
        <Paper variant="outlined" sx={{ ...card, px: 1.25 }}>
          <Box sx={{ width: { xs: 260, sm: 360, md: 300 } }}>
            <TextField
              fullWidth
              placeholder="Search name, email, or phone"
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiInputBase-root': { backgroundColor: 'transparent' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* table - full-width lines, content inset on first/last columns */}
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
              <TableCell sx={{ ...th, width: '18%' }}>Name</TableCell>
              <TableCell sx={{ ...th, width: '14%' }}>Phone</TableCell>
              <TableCell sx={{ ...th, width: '18%' }}>Email</TableCell>
              <TableCell sx={{ ...th, width: '12%' }}>Account ID</TableCell>
              <TableCell sx={{ ...th, width: '12%' }}>Transporter ID</TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>Status</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => setStatusEl(e.currentTarget)}
                    sx={{ p: 0.25 }}
                    aria-label="status filter"
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Menu
                  anchorEl={statusEl}
                  open={Boolean(statusEl)}
                  onClose={() => setStatusEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{ sx: menuPaperSx }}
                  MenuListProps={{ dense: true, sx: menuListSx }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} onClick={() => { setStatusFilter(s); setStatusEl(null); }} sx={navLikeItemSx}>
                      {s}
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
              <TableCell sx={{ ...th, width: '12%' }}>Depot</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((d) => {
              const accountId = d.email || '—';
              return (
                <TableRow key={d.email} hover>
                  <TableCell>
                    <Typography
                      component={RouterLink}
                      to={`/admin/drivers/${encodeURIComponent(d.email)}`}
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {d.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{accountId}</TableCell>
                  <TableCell>
                    <Typography
                      component={RouterLink}
                      to={`/admin/drivers/${encodeURIComponent(d.email)}`}
                      sx={{ fontSize: 12, color: d.transporter_id ? 'primary.main' : '#9CA3AF', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {d.transporter_id || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={d.status}
                      onChange={(e) => setStatusFor(d.id, e.target.value)}
                      size="small"
                      input={<OutlinedInput />}
                      MenuProps={{ MenuListProps: { dense: true } }}
                      sx={{
                        height: 24,
                        minHeight: 24,
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: STATUS_COLORS[d.status]?.bg || '#F3F4F6',
                        color: STATUS_COLORS[d.status]?.fg || '#374151',
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSelect-select': { p: '0 20px 0 8px !important', minHeight: 'unset !important', lineHeight: '24px' },
                        '& .MuiSelect-icon': { fontSize: 14, color: STATUS_COLORS[d.status]?.fg || '#374151', right: 4 },
                      }}
                    >
                      {['Active', 'Inactive', 'Onboarding', 'Offboarded'].map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: 11 }}>{s}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={d.depot || ''}
                      onChange={(e) => setDepotFor(d.id, e.target.value)}
                      size="small"
                      input={<OutlinedInput />}
                      MenuProps={{ MenuListProps: { dense: true } }}
                      sx={{
                        height: 24,
                        minHeight: 24,
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: '#F0FDF4',
                        color: '#166534',
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSelect-select': { p: '0 20px 0 8px !important', minHeight: 'unset !important', lineHeight: '24px' },
                        '& .MuiSelect-icon': { fontSize: 14, color: '#166534', right: 4 },
                      }}
                    >
                      {allDepots.map((dp) => (
                        <MenuItem key={dp} value={dp} sx={{ fontSize: 12 }}>{dp}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  No drivers match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Add Driver Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAddIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Add Driver</Typography>
          </Stack>
        </Box>
        <Divider />
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>First Name *</Typography>
              <TextField fullWidth size="small" value={addForm.firstName} onChange={setAdd('firstName')} placeholder="First name" />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Last Name *</Typography>
              <TextField fullWidth size="small" value={addForm.lastName} onChange={setAdd('lastName')} placeholder="Last name" />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Email *</Typography>
              <TextField fullWidth size="small" value={addForm.email} onChange={setAdd('email')} placeholder="email@example.com" type="email" />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Phone</Typography>
              <TextField fullWidth size="small" value={addForm.phone} onChange={setAdd('phone')} placeholder="+447..." />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Station</Typography>
              <TextField fullWidth size="small" select value={addForm.depot} onChange={setAdd('depot')}>
                {allDepots.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Account ID</Typography>
              <TextField fullWidth size="small" value={addForm.amazonId} onChange={setAdd('amazonId')} placeholder="Account ID" />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Transporter ID</Typography>
              <TextField fullWidth size="small" value={addForm.transporterId} onChange={setAdd('transporterId')} placeholder="Transporter ID" />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDriver}
            disabled={!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim() || addSubmitting}
            sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700, px: 2.5 }}
          >
            {addSubmitting ? 'Adding...' : 'Add Driver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

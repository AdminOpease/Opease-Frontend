// src/pages/Admin/Drivers.jsx
import * as React from 'react';
import {
  Box, Paper, Stack, TextField, InputAdornment,
  Chip, IconButton, Menu, MenuItem, Table, TableHead, TableBody, TableRow, TableCell, Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import StatusChip from '../../components/common/StatusChip';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Onboarding', 'Offboarded'];

export default function AdminDrivers() {
  const { drivers = [], setDrivers } = useAppStore();

  // Depot (nav-style pill dropdown)
  const depots = React.useMemo(
    () => [ALL, ...Array.from(new Set(drivers.map((d) => d.depot)))],
    [drivers]
  );
  const [depot, setDepot] = React.useState(ALL);
  const [depotEl, setDepotEl] = React.useState(null);
  const depotOpen = Boolean(depotEl);

  // Search (centered, compact)
  const [query, setQuery] = React.useState('');

  // Status filter in header (defaults to Active)
  const [statusFilter, setStatusFilter] = React.useState('Active');
  const [statusEl, setStatusEl] = React.useState(null);

  // Row actions (":" menu)
  const [rowMenuEl, setRowMenuEl] = React.useState(null);
  const [rowEmail, setRowEmail] = React.useState(null);

  // Derived lists
  const byDepot = React.useMemo(
    () => (depot === ALL ? drivers : drivers.filter((d) => d.depot === depot)),
    [drivers, depot]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return byDepot
      .filter((d) =>
        !q
          ? true
          : (d.name || '').toLowerCase().includes(q) ||
            (d.email || '').toLowerCase().includes(q) ||
            (d.phone || '').toLowerCase().includes(q)
      )
      .filter((d) => (statusFilter === 'All' ? true : d.status === statusFilter));
  }, [byDepot, query, statusFilter]);

  // Status counts (based on depot)
  const counts = React.useMemo(() => {
    const base = { Active: 0, Inactive: 0, Onboarding: 0, Offboarded: 0 };
    for (const d of byDepot) base[d.status] = (base[d.status] || 0) + 1;
    return base;
  }, [byDepot]);

  // Row action -> update status
  const setStatusFor = (email, newStatus) => {
    const normalized =
      newStatus === 'Onboard' ? 'Onboarding' :
      newStatus === 'Offboard' ? 'Offboarded' : newStatus;
    setDrivers((prev) =>
      prev.map((d) => (d.email === email ? { ...d, status: normalized } : d))
    );
  };

  // ---- styles ----
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

  // Shared "nav-style" menu look (Depot + Status)
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

  // Condensed row Actions menu
  const rowMenuPaperSx = {
    mt: 0.5,
    minWidth: 140,              // narrower
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
    py: 0.6,                    // tighter vertical padding
    fontSize: 13,               // smaller text
    lineHeight: 1.2,
    '&:hover': { backgroundColor: 'action.hover' },
  };

  return (
    <Box sx={pageSx}>
      {/* top-right depot pill */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
            <Chip label={`Active: ${counts.Active || 0}`}         variant="outlined" sx={statChip} />
            <Chip label={`Inactive: ${counts.Inactive || 0}`}     variant="outlined" sx={statChip} />
            <Chip label={`Onboarding: ${counts.Onboarding || 0}`} variant="outlined" sx={statChip} />
            <Chip label={`Offboarded: ${counts.Offboarded || 0}`} variant="outlined" sx={statChip} />
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
              <TableCell sx={{ ...th, width: '22%' }}>Name</TableCell>
              <TableCell sx={{ ...th, width: '16%' }}>Phone</TableCell>
              <TableCell sx={{ ...th, width: '22%' }}>Email</TableCell>
              <TableCell sx={{ ...th, width: '14%' }}>Account ID</TableCell>
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
              <TableCell sx={{ ...th, width: '10%' }}>Depot</TableCell>
              <TableCell align="right" sx={{ ...th, width: '2%' }}>Actions</TableCell>
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
                  <TableCell><StatusChip status={d.status} /></TableCell>
                  <TableCell>{d.depot}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="more"
                      onClick={(e) => { setRowMenuEl(e.currentTarget); setRowEmail(d.email); }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  No drivers match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Row actions menu – condensed */}
      <Menu
        anchorEl={rowMenuEl}
        open={Boolean(rowMenuEl)}
        onClose={() => { setRowMenuEl(null); setRowEmail(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: rowMenuPaperSx }}
        MenuListProps={{ dense: true, sx: { py: 0 } }}
      >
        {['Active', 'Inactive', 'Onboard', 'Offboard'].map((opt) => (
          <MenuItem
            key={opt}
            onClick={() => {
              if (rowEmail) setStatusFor(rowEmail, opt);
              setRowMenuEl(null);
              setRowEmail(null);
            }}
            sx={rowMenuItemSx}
          >
            {opt}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

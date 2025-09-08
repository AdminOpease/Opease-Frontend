// src/pages/Admin/ExpiringDocs.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Menu, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';
const DOC_TYPES = ['All', 'Right to Work', 'DVLA', 'Licence'];

// Match Drivers page spacing
const pageSx = { mt: -10 };

// Depot pill button (same look as Drivers)
const pillBtnSx = {
  borderRadius: 9999,
  px: 2,
  minHeight: 34,
  border: '1px solid',
  borderColor: 'rgba(46,76,30,0.35)',
  color: 'primary.main',
  '&:hover': { backgroundColor: 'rgba(46,76,30,0.06)' },
};

// Shared menu look (same as Drivers)
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

// Header cell style (same as Drivers)
const th = { fontWeight: 700 };

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(`${dateStr}T00:00:00`);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function inWindow(doc) {
  const days = daysUntil(doc.expiryDate);
  if (days == null) return false;
  return doc.type === 'DVLA' ? days <= 7 : days <= 30;
}

export default function ExpiringDocs() {
  const { depots, documents, drivers } = useAppStore();
  const depotOptions = [ALL, ...depots];

  const [depot, setDepot] = React.useState(ALL);
  const [docType, setDocType] = React.useState('All');

  // Menu anchors
  const [depotEl, setDepotEl] = React.useState(null);
  const [typeEl, setTypeEl] = React.useState(null);

  // Phone lookup from drivers (by email) — for Phone column
  const phoneByEmail = React.useMemo(() => {
    const map = {};
    for (const d of drivers || []) map[d.email] = d.phone || '—';
    return map;
  }, [drivers]);

  const filtered = React.useMemo(() => {
    let rows = documents
      .filter((d) => !d.deletedAt)
      .map((d) => ({
        id: d.id,
        driverName: d.driverName,
        driverEmail: d.driverEmail,
        driverPhone: phoneByEmail[d.driverEmail] || '—',
        depot: d.depot,
        type: d.type,
        expiryDate: d.expiryDate || null,
      }));

    if (depot !== ALL) rows = rows.filter((r) => r.depot === depot);
    if (docType !== 'All') rows = rows.filter((r) => r.type === docType);

    return rows
      .map((r) => ({ ...r, daysLeft: daysUntil(r.expiryDate) }))
      .sort((a, b) => (a.daysLeft ?? 99999) - (b.daysLeft ?? 99999));
  }, [documents, depot, docType, phoneByEmail]);

  return (
    <Box sx={pageSx}>
      {/* top-right depot pill (Doc Type filter is inline in header like Drivers' Status) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
        <IconButton onClick={(e) => setDepotEl(e.currentTarget)} sx={pillBtnSx}>
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
          {depotOptions.map((d) => (
            <MenuItem key={d} onClick={() => { setDepot(d); setDepotEl(null); }} sx={navLikeItemSx}>
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Table container matches Drivers: outlined, rounded, and overflow hidden */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
              <TableCell sx={{ ...th, width: '22%' }}>Driver</TableCell>
              <TableCell sx={{ ...th, width: '16%' }}>Phone</TableCell>
              <TableCell sx={{ ...th, width: '22%' }}>Email (ID)</TableCell>
              <TableCell sx={{ ...th, width: '10%' }}>Depot</TableCell>

              {/* Doc Type header with inline filter (mirrors Drivers' Status header) */}
              <TableCell sx={{ width: '12%' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>Doc Type</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => setTypeEl(e.currentTarget)}
                    sx={{ p: 0.25 }}
                    aria-label="doc type filter"
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Menu
                  anchorEl={typeEl}
                  open={Boolean(typeEl)}
                  onClose={() => setTypeEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{ sx: menuPaperSx }}
                  MenuListProps={{ dense: true, sx: menuListSx }}
                >
                  {DOC_TYPES.map((t) => (
                    <MenuItem key={t} onClick={() => { setDocType(t); setTypeEl(null); }} sx={navLikeItemSx}>
                      {t}
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>

              <TableCell sx={{ ...th, width: '14%' }}>Expiry Date</TableCell>
              <TableCell sx={{ ...th, width: '12%' }}>Days Left</TableCell>
              <TableCell sx={{ ...th, width: '10%' }}>Window</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ fontSize: 12, color: 'text.secondary', py: 3, textAlign: 'center' }}>
                  No expiring documents found.
                </TableCell>
              </TableRow>
            )}

            {filtered.map((r) => (
              <TableRow key={`${r.driverEmail}-${r.type}-${r.expiryDate || 'none'}`} hover>
                <TableCell>
                  <Typography
                    component={RouterLink}
                    to={`/admin/drivers/${encodeURIComponent(r.driverEmail)}`}
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {r.driverName}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.driverPhone}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.driverEmail}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.depot}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.type}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.expiryDate || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.daysLeft ?? '—'}</TableCell>
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

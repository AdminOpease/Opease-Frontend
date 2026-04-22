// src/pages/Admin/ExpiringDocs.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Stack, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Menu, MenuItem, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link as RouterLink } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import { documents as docsApi, drivers as driversApi } from '../../services/api';

const ALL = 'All Depots';
const DOC_TYPES = ['All', 'Licence', 'DVLA', 'Right to Work'];

const pageSx = {}; // was mt:-10 — content now sits below nav like Operations pages
const pillBtnSx = {
  borderRadius: 9999, px: 2, minHeight: 34,
  border: '1px solid', borderColor: 'rgba(46,76,30,0.35)',
  color: 'primary.main',
  '&:hover': { backgroundColor: 'rgba(46,76,30,0.06)' },
};
const menuPaperSx = {
  mt: 0.5, minWidth: 200, borderRadius: 2,
  border: '1px solid', borderColor: 'divider',
  boxShadow: '0 6px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
};
const menuListSx = { py: 0 };
const navLikeItemSx = {
  justifyContent: 'center', textAlign: 'center', px: 2, py: 0.9,
  fontSize: 14, lineHeight: 1.25,
  '&:hover': { backgroundColor: 'action.hover' },
};
const th = { fontWeight: 700 };

const STATUS_COLORS = {
  overdue: { bg: '#FEE2E2', fg: '#991B1B' },
  urgent: { bg: '#FEF3C7', fg: '#92400E' },
  warning: { bg: '#FEF9C3', fg: '#713F12' },
  submitted: { bg: '#DCFCE7', fg: '#065F46' },
};

function statusInfo(row) {
  if (row.days_remaining < 0) return { ...STATUS_COLORS.overdue, label: 'Overdue' };
  if (row.days_remaining <= 7) return { ...STATUS_COLORS.urgent, label: 'Urgent' };
  return { ...STATUS_COLORS.warning, label: 'Due Soon' };
}

export default function ExpiringDocs() {
  const { depots } = useAppStore();
  const depotOptions = [ALL, ...depots];

  const [depot, setDepot] = React.useState('All Depots');
  const [docType, setDocType] = React.useState('All');
  const [rows, setRows] = React.useState([]);
  const [depotEl, setDepotEl] = React.useState(null);
  const [typeEl, setTypeEl] = React.useState(null);

  // Fetch expiring data from backend
  const fetchExpiring = React.useCallback(async () => {
    try {
      const params = depot !== ALL ? { depot } : {};
      const res = await docsApi.getExpiring(params);
      setRows(res.data || []);
    } catch (e) {
      console.error('Failed to fetch expiring:', e);
    }
  }, [depot]);

  React.useEffect(() => { fetchExpiring(); }, [fetchExpiring]);
  React.useEffect(() => {
    const id = setInterval(fetchExpiring, 10_000);
    return () => clearInterval(id);
  }, [fetchExpiring]);

  // Accept: for DVLA, update last_dvla_check to today and clear the code. For RTW, clear the code.
  const handleAccept = async (row) => {
    try {
      const patch = {};
      if (row.type === 'DVLA') {
        patch.last_dvla_check = new Date().toISOString().slice(0, 10);
        patch.dvla_check_code = null;
        patch.dvla_code_submitted_at = null;
      } else if (row.type === 'Right to Work') {
        // Move the new share code to the main share_code field and clear submission
        patch.share_code = row.rtw_share_code_new;
        patch.rtw_share_code_new = null;
        patch.rtw_code_submitted_at = null;
      }
      await driversApi.update(row.driver_id, patch);
      fetchExpiring();
    } catch (e) {
      console.error('Failed to accept:', e);
    }
  };

  // Deny: clear the submitted code so candidate can resubmit
  const handleDeny = async (row) => {
    try {
      const patch = {};
      if (row.type === 'DVLA') {
        patch.dvla_check_code = null;
        patch.dvla_code_submitted_at = null;
      } else if (row.type === 'Right to Work') {
        patch.rtw_share_code_new = null;
        patch.rtw_code_submitted_at = null;
      }
      await driversApi.update(row.driver_id, patch);
      fetchExpiring();
    } catch (e) {
      console.error('Failed to deny:', e);
    }
  };

  const filtered = React.useMemo(() => {
    if (docType === 'All') return rows;
    return rows.filter((r) => r.type === docType);
  }, [rows, docType]);

  return (
    <Box sx={pageSx}>
      {/* ── Page header bar ─────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={(e) => setDepotEl(e.currentTarget)} sx={pillBtnSx}>
            <Typography component="span" sx={{ mr: 1, fontWeight: 700, fontSize: 14 }}>{depot}</Typography>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={depotEl} open={Boolean(depotEl)} onClose={() => setDepotEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            PaperProps={{ sx: menuPaperSx }} MenuListProps={{ dense: true, sx: menuListSx }}>
            {depotOptions.map((d) => (
              <MenuItem key={d} onClick={() => { setDepot(d); setDepotEl(null); }} sx={navLikeItemSx}>{d}</MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small" sx={{
          '& th, & td': { px: 1.5 },
          '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
          '& thead th:last-of-type,  & tbody td:last-of-type': { pr: 3 },
        }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...th, width: '18%' }}>Driver</TableCell>
              <TableCell sx={{ ...th, width: '12%' }}>Phone</TableCell>
              <TableCell sx={{ ...th, width: '10%' }}>Depot</TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>Type</Typography>
                  <IconButton size="small" onClick={(e) => setTypeEl(e.currentTarget)} sx={{ p: 0.25 }}>
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Menu anchorEl={typeEl} open={Boolean(typeEl)} onClose={() => setTypeEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{ sx: menuPaperSx }} MenuListProps={{ dense: true, sx: menuListSx }}>
                  {DOC_TYPES.map((t) => (
                    <MenuItem key={t} onClick={() => { setDocType(t); setTypeEl(null); }} sx={navLikeItemSx}>{t}</MenuItem>
                  ))}
                </Menu>
              </TableCell>
              <TableCell sx={{ ...th, width: '12%' }}>Expiry Date</TableCell>
              <TableCell sx={{ ...th, width: '10%' }}>Days Left</TableCell>
              <TableCell sx={{ ...th, width: '10%' }}>Status</TableCell>
              <TableCell sx={{ ...th, width: '14%' }}>Candidate Response</TableCell>
              <TableCell sx={{ ...th, width: '10%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ fontSize: 12, color: 'text.secondary', py: 3, textAlign: 'center' }}>
                  No expiring credentials found.
                </TableCell>
              </TableRow>
            )}

            {filtered.map((r, i) => {
              const si = statusInfo(r);
              const hasCode = (r.type === 'DVLA' && r.dvla_check_code) || (r.type === 'Right to Work' && r.rtw_share_code_new);
              const codeVal = r.type === 'DVLA' ? r.dvla_check_code : r.rtw_share_code_new;
              const codeDate = r.type === 'DVLA' ? r.dvla_code_submitted_at : r.rtw_code_submitted_at;

              return (
                <TableRow key={`${r.driver_id}-${r.type}-${i}`} hover>
                  <TableCell>
                    <Typography component={RouterLink} to={`/admin/drivers/${encodeURIComponent(r.driver_email)}/profile`}
                      sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {r.driver_name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.driver_phone || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.depot || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.type}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.expiry_date || '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 700, color: r.days_remaining < 0 ? '#991B1B' : r.days_remaining <= 7 ? '#92400E' : '#374151' }}>
                    {r.days_remaining}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={si.label}
                      sx={{ fontSize: 11, height: 22, borderRadius: 999, bgcolor: si.bg, color: si.fg, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    {hasCode ? (
                      <Tooltip title={`Submitted: ${codeDate ? new Date(codeDate).toLocaleDateString('en-GB') : '—'}`}>
                        <Chip size="small" icon={<CheckCircleIcon />}
                          label={codeVal}
                          sx={{ fontSize: 11, height: 22, borderRadius: 999, bgcolor: '#DCFCE7', color: '#065F46', fontWeight: 600,
                            '& .MuiChip-icon': { color: '#065F46', fontSize: 14 } }} />
                      </Tooltip>
                    ) : r.type === 'Licence' ? (
                      <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>—</Typography>
                    ) : (
                      <Chip size="small" label="Awaiting"
                        sx={{ fontSize: 11, height: 22, borderRadius: 999, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {hasCode ? (
                      <Stack direction="row" spacing={0.5}>
                        <Chip size="small" label="Accept" clickable onClick={() => handleAccept(r)}
                          sx={{ fontSize: 11, height: 22, borderRadius: 999, bgcolor: '#DCFCE7', color: '#065F46', fontWeight: 600, cursor: 'pointer' }} />
                        <Chip size="small" label="Deny" clickable onClick={() => handleDeny(r)}
                          sx={{ fontSize: 11, height: 22, borderRadius: 999, bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 600, cursor: 'pointer' }} />
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

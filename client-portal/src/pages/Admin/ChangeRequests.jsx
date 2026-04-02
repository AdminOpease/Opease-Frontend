// src/pages/Admin/ChangeRequests.jsx
import * as React from 'react';
import {
  Box, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Chip, Button, Stack, Select, MenuItem, OutlinedInput, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppStore } from '../../state/AppStore.jsx';

const STATUS_COLORS = {
  Pending: { bg: '#FEF3C7', fg: '#92400E' },
  Approved: { bg: '#DCFCE7', fg: '#065F46' },
  Rejected: { bg: '#FEE2E2', fg: '#991B1B' },
};

const FIELD_LABELS = {
  'payment.bank_name': 'Bank / Building Society',
  'payment.sort_code': 'Sort Code',
  'payment.account_number': 'Account Number',
  'payment.tax_reference': 'Unique Tax Reference',
  'payment.vat_number': 'VAT Number',
  'emergency.name': 'Emergency Name',
  'emergency.relationship': 'Emergency Relationship',
  'emergency.phone': 'Emergency Phone',
  'emergency.email': 'Emergency Email',
  'account.email': 'Email',
  'account.phone': 'Phone',
};

export default function ChangeRequests() {
  const { drivers, changeRequests, fetchChangeRequests, updateChangeRequest } = useAppStore();
  const [filter, setFilter] = React.useState('Pending');
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    fetchChangeRequests();
  }, [fetchChangeRequests]);

  const driverMap = React.useMemo(() => {
    const map = {};
    (drivers || []).forEach((d) => { map[d.id] = d; });
    return map;
  }, [drivers]);

  const filtered = React.useMemo(() => {
    let items = changeRequests || [];
    if (filter !== 'All') items = items.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((r) => {
        const d = driverMap[r.driver_id];
        const name = d ? `${d.first_name} ${d.last_name}`.toLowerCase() : '';
        return name.includes(q) || (r.field_name || '').toLowerCase().includes(q);
      });
    }
    return items;
  }, [changeRequests, filter, query, driverMap]);

  const handleAction = async (id, action) => {
    await updateChangeRequest(id, action);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 2, flexWrap: 'wrap', mt: 0, mb: 1,
        }}
      >
        <Stack direction="row" spacing={1} sx={{
          bgcolor: '#f5f5f5', borderRadius: 999, px: 0.5, py: 0.5,
        }}>
          {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
            <Chip
              key={s}
              label={`${s}${s !== 'All' ? `: ${(changeRequests || []).filter((r) => r.status === s).length}` : ''}`}
              onClick={() => setFilter(s)}
              sx={{
                fontWeight: 600, cursor: 'pointer',
                bgcolor: filter === s ? '#fff' : 'transparent',
                boxShadow: filter === s ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
              }}
            />
          ))}
        </Stack>

        <Box sx={{
          display: 'flex', alignItems: 'center', bgcolor: '#fff',
          borderRadius: 999, border: '1px solid #E5E7EB', px: 1, maxWidth: 340,
        }}>
          <TextField
            size="small" fullWidth placeholder="Search name or field..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiInputBase-root': { backgroundColor: 'transparent', height: 44 },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{ border: '1px solid #E5E7EB', borderRadius: 2, overflow: 'hidden' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell sx={{ fontWeight: 700 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Current Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Requested Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#9CA3AF' }}>
                  No change requests found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const d = driverMap[r.driver_id];
                const name = d ? `${d.first_name} ${d.last_name}` : r.driver_id?.slice(0, 8);
                const statusStyle = STATUS_COLORS[r.status] || STATUS_COLORS.Pending;
                return (
                  <TableRow key={r.id}>
                    <TableCell>{name}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{r.section}</TableCell>
                    <TableCell>{FIELD_LABELS[r.field_name] || r.field_name}</TableCell>
                    <TableCell sx={{ color: '#9CA3AF' }}>{r.old_value || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.new_value}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        size="small"
                        sx={{ bgcolor: statusStyle.bg, color: statusStyle.fg, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {r.status === 'Pending' ? (
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleAction(r.id, 'Approved')}
                            sx={{ textTransform: 'none', fontSize: 12 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleAction(r.id, 'Rejected')}
                            sx={{ textTransform: 'none', fontSize: 12 }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

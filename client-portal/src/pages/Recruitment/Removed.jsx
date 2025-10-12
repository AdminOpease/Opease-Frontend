// client-portal/src/pages/Recruitment/Removed.jsx
import * as React from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

export default function Removed() {
  const { applications, restoreDriver } = useAppStore();

  // Removed applications
  const removed = React.useMemo(
    () => applications.filter((a) => !!a.removedAt),
    [applications]
  );

  // Search
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return removed;
    return removed.filter((r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      (r.accountId || '').toLowerCase().includes(q) ||
      (r.station || r.depot || '').toLowerCase().includes(q)
    );
  }, [removed, query]);

  // Columns
  const cols = [
    'Date Applied',
    'Station',
    'Full Name',
    'Phone',
    'Account ID',
    'Stage at Removal',
    'Comment',
  ];

  // Helper to show the phase at time of removal (best effort)
  const phaseAtRemoval = (a) =>
    a.removedStage ||
    (a.bgc !== 'Pending' || a.training || a.contractSigning === 'Complete' || a.dcc
      ? 'Phase 2'
      : 'Phase 1');

  return (
    <Box>
      {/* Centered search bar (same styling language as Onboarding) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            px: 1.25,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Box sx={{ width: { xs: 280, sm: 420, md: 520 }, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search name, email, phone, station, or account ID"
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiInputBase-root': { backgroundColor: 'transparent', height: 44 },
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

      <PhaseTable
        // no page title — just the table
        rows={filtered}
        cols={cols}
        // Use the "Activate" slot to perform a Restore
        onActivate={(email) => restoreDriver(email)}
        renderCell={(row, label) => {
          if (label === 'Station') return row.station || row.depot || '-';
          if (label === 'Account ID') return row.accountId || '-';
          if (label === 'Stage at Removal') return phaseAtRemoval(row);
          if (label === 'Comment') return row.removedComment || '-';
          if (label === 'Date Applied') return row.dateApplied || '-';
          return undefined; // fallback to default renderer
        }}
        // Pagination (25 per page)
        paginate
        rowsPerPageOptions={[25, 50, 100]}
        defaultRowsPerPage={25}
      />
    </Box>
  );
}

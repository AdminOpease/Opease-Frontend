// src/pages/Recruitment/OnboardingPhase1.jsx
import * as React from 'react';
import {
  Box, Paper, TextField, InputAdornment, Chip, Stack,
  Select, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

const PREDCC_OPTIONS = ['In Review', 'FIR', 'Complete', 'DMR'];

export default function OnboardingPhase1() {
  // note: Phase 1 and Phase 2 use different tables/columns
  const { phase1, phase2, colsPhase1, setRemoveFor } = useOutletContext();
  const { updateApplication } = useAppStore();

  // Search
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phase1;
    return phase1.filter((r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q)
    );
  }, [phase1, query]);

  // Inline editor for the "Pre-DCC" column (Phase 1 only)
  const PreDccEditor = ({ row }) => {
    const value = row.preDCC || 'In Review';
    const handleChange = (e) =>
      typeof updateApplication === 'function' &&
      updateApplication(row.email, { preDCC: e.target.value });
    return (
      <Select
        size="small"
        variant="outlined"
        value={value}
        onChange={handleChange}
        sx={{ minWidth: 140, height: 32 }}
      >
        {PREDCC_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>
    );
  };

  // Styles
  const headerRowSx = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
    mb: 2,
  };
  const pillGroupSx = {
    borderRadius: 9999,
    border: '1px solid',
    borderColor: 'divider',
    px: 1,
    py: 0.75,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
  };
  const searchPillSx = {
    borderRadius: 9999,
    border: '1px solid',
    borderColor: 'divider',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    px: 1.25,
  };
  const chipSx = { borderRadius: 9999, fontWeight: 700 };

  return (
    <Box>
      {/* Centered header row: chips + search */}
      <Box sx={headerRowSx}>
        <Paper variant="outlined" sx={pillGroupSx}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Chip size="small" variant="outlined" label={`Phase 1: ${phase1.length}`} sx={chipSx} />
            <Chip size="small" variant="outlined" label={`Phase 2: ${phase2.length}`} sx={chipSx} />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={searchPillSx}>
          <Box sx={{ width: { xs: 260, sm: 360, md: 300 } }}>
            <TextField
              fullWidth
              placeholder="Search name, email, or phone"
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
        title="Phase 1"
        rows={filtered}
        cols={colsPhase1}
        // Phase 1 actions: Proceed -> moves to Phase 2, plus Remove
        onProceed={(email) => updateApplication(email, { bgc: 'In Review' })}
        onRemove={(email) => setRemoveFor(email)}
        // Only override Pre-DCC; all other cells use the table's default renderer
        renderCell={(row, label) => {
          if (label === 'Pre-DCC') return <PreDccEditor row={row} />;
          return undefined; // let PhaseTable fall back to default for everything else
        }}
      />
    </Box>
  );
}

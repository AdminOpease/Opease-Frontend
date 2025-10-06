// src/pages/Recruitment/OnboardingPhase2.jsx
import * as React from 'react';
import {
  Box, Paper, TextField, InputAdornment, Chip, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

export default function OnboardingPhase2() {
  const { phase1, phase2, colsPhase2, activateDriver, setRemoveFor } = useOutletContext();
  const { updateApplication } = useAppStore();

  // Search
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phase2;
    return phase2.filter((r) =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q)
    );
  }, [phase2, query]);

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

  // Move a Phase 2 record back into Phase 1:
  // Phase 1 rule is: bgc === 'Pending' && !training && contractSigning !== 'Complete' && !dcc
  const returnToPhase1 = (email) => {
    if (typeof updateApplication === 'function') {
      updateApplication(email, {
        bgc: 'Pending',
        training: null,
        contractSigning: 'Pending',
        dcc: null,
      });
    }
  };

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
        title="Phase 2"
        rows={filtered}
        cols={colsPhase2}
        onActivate={(email) => activateDriver(email)}
        onReturnToPhase1={(email) => returnToPhase1(email)}  // ← NEW
        onRemove={(email) => setRemoveFor(email)}
      />
    </Box>
  );
}

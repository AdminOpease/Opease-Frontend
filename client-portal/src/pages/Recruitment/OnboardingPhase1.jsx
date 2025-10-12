// src/pages/Recruitment/OnboardingPhase1.jsx
import * as React from 'react';
import {
  Box, Paper, TextField, InputAdornment, Chip, Stack,
  Select, MenuItem, OutlinedInput
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

const PREDCC_OPTIONS = ['In Review', 'FIR', 'Complete', 'DMR'];
const DL_OPTIONS = ['Pending', 'Pass', 'Fail'];

export default function OnboardingPhase1() {
  const {
    phase1, phase2, colsPhase1, setRemoveFor,
    phase1Count, phase2Count,
  } = useOutletContext();
  const { updateApplication } = useAppStore();

  // Search
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phase1;
    return phase1.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [phase1, query]);

  // Pre-DCC
  const PreDccEditor = ({ row }) => {
    const value = row.preDCC || 'In Review';
    const handleChange = (e) => updateApplication(row.email, { preDCC: e.target.value });
    return (
      <Select
        value={value}
        onChange={handleChange}
        input={
          <OutlinedInput
            size="small"
            sx={{
              height: 28,
              borderRadius: 1.25,
              fontSize: 'inherit',
              pr: 3,
              '& .MuiOutlinedInput-input': { p: 0 },
            }}
          />
        }
        MenuProps={{ MenuListProps: { dense: true } }}
        sx={{
          minWidth: 108,
          '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
          '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
        }}
      >
        {PREDCC_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>
    );
  };

  // Account ID
  const AccountIdEditor = ({ row }) => {
    const initial = row.accountId || '';
    const [local, setLocal] = React.useState(initial);
    React.useEffect(() => setLocal(initial), [initial]);
    const commit = () => {
      const next = (local || '').trim();
      if ((row.accountId || '') !== next) updateApplication(row.email, { accountId: next });
    };
    return (
      <TextField
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') { commit(); e.currentTarget.blur(); } }}
        placeholder="Enter Account ID"
        variant="outlined"
        size="small"
        sx={{
          ml: -1,
          width: 220,
          '& .MuiOutlinedInput-notchedOutline': { borderRadius: 1.25 },
          '& .MuiInputBase-root': { height: 28, fontSize: 'inherit', px: 1 },
        }}
      />
    );
  };

  // DL Verification
  const DlVerificationEditor = ({ row }) => {
    const value = row.dlVerification || 'Pending';
    const handleChange = (e) => updateApplication(row.email, { dlVerification: e.target.value });
    return (
      <Select
        value={value}
        onChange={handleChange}
        input={
          <OutlinedInput
            size="small"
            sx={{
              height: 28,
              borderRadius: 1.25,
              fontSize: 'inherit',
              pr: 3,
              '& .MuiOutlinedInput-input': { p: 0 },
            }}
          />
        }
        MenuProps={{ MenuListProps: { dense: true } }}
        sx={{
          minWidth: 108,
          '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
          '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
        }}
      >
        {DL_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>
    );
  };

  // Header styling
  const headerRowSx = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
    mt: 0,
    mb: 1,
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
      <Box sx={headerRowSx}>
        <Paper variant="outlined" sx={pillGroupSx}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Chip size="small" variant="outlined" label={`Phase 1: ${phase1Count}`} sx={chipSx} />
            <Chip size="small" variant="outlined" label={`Phase 2: ${phase2Count}`} sx={chipSx} />
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
        onProceed={(email) => updateApplication(email, { bgc: 'Not Applied' })}
        onRemove={(email) => setRemoveFor(email)}
        profilePathFor={(r) => `/admin/drivers/${encodeURIComponent(r.email)}`}
        documentsPathFor={(r) => `/admin/drivers/${encodeURIComponent(r.email)}/documents`}
        renderCell={(row, label) => {
          if (label === 'Pre-DCC') return <PreDccEditor row={row} />;
          if (label === 'Account ID') return <AccountIdEditor row={row} />;
          if (label === 'DL Verification') return <DlVerificationEditor row={row} />;
          if (label === 'Station') return row.station || row.depot || '-';
          return undefined;
        }}
        paginate
        rowsPerPageOptions={[25, 50, 100]}
        defaultRowsPerPage={25}
      />
    </Box>
  );
}

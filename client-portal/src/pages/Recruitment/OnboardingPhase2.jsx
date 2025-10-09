// client-portal/src/pages/Recruitment/OnboardingPhase2.jsx
import * as React from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

const BGC_OPTIONS = ['Not Applied', 'Pending', 'Pass', 'Fail'];
const DCC_OPTIONS = ['Need to Review', 'Complete'];

export default function OnboardingPhase2() {
  const {
    phase2,
    colsPhase2,
    activateDriver,
    setRemoveFor,
    phase1Count,
    phase2Count,
  } = useOutletContext();

  const { updateApplication } = useAppStore();

  // Search
  const [query, setQuery] = React.useState('');
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phase2;
    return phase2.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [phase2, query]);

  // ---------- Background Check editor ----------
  const BackgroundCheckEditor = ({ row }) => {
    const current = row.bgc === 'In Review' ? 'Pending' : row.bgc || 'Not Applied';
    const handleChange = (e) => updateApplication(row.email, { bgc: e.target.value });
    return (
      <Select
        value={current}
        onChange={handleChange}
        input={
          <OutlinedInput
            size="small"
            sx={{
              height: 28,
              borderRadius: 1.25,
              fontSize: 'inherit',
              pr: 2.25,
              '& .MuiOutlinedInput-input': { p: 0.25 },
            }}
          />
        }
        MenuProps={{ MenuListProps: { dense: true } }}
        sx={{
          minWidth: 140,
          '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
          '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
        }}
      >
        {BGC_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    );
  };

  // ---------- Training editor ----------
  const parseTraining = (t) => {
    if (!t) return { date: '', company: '', session: '' };
    if (typeof t === 'string') {
      const m = t.match(/^(\d{4}-\d{2}-\d{2})\s+(SC|DK)\s+S?(\d+)$/i);
      if (m) return { date: m[1], company: m[2].toUpperCase(), session: m[3] };
      return { date: '', company: '', session: '' };
    }
    return { date: t.date || '', company: t.company || '', session: t.session || '' };
  };

  const TrainingEditor = ({ row }) => {
    const [val, setVal] = React.useState(parseTraining(row.training));
    React.useEffect(() => setVal(parseTraining(row.training)), [row.training]);

    const commit = (next) => {
      const hasAny = next.date || next.company || next.session;
      updateApplication(row.email, { training: hasAny ? next : null });
    };

    return (
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: -0.5 }}>
        <TextField
          type="date"
          size="small"
          value={val.date}
          onChange={(e) => {
            const next = { ...val, date: e.target.value };
            setVal(next);
            commit(next);
          }}
          sx={{
            minWidth: 112,
            '& .MuiInputBase-root': {
              height: 28,
              fontSize: 'inherit',
              borderRadius: 1.25,
              px: 0.75,
            },
            '& .MuiInputBase-input': { py: 0.25 },
          }}
        />
        <Select
          value={val.company}
          displayEmpty
          onChange={(e) => {
            const next = { ...val, company: e.target.value };
            setVal(next);
            commit(next);
          }}
          input={
            <OutlinedInput
              size="small"
              sx={{
                height: 28,
                borderRadius: 1.25,
                fontSize: 'inherit',
                pr: 2,
                '& .MuiOutlinedInput-input': { p: 0.25 },
              }}
            />
          }
          MenuProps={{ MenuListProps: { dense: true } }}
          sx={{
            minWidth: 58,
            '& .MuiSelect-select': { py: 0, px: 0.75, minHeight: 'unset' },
            '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
          }}
        >
          <MenuItem value="">
            <em>—</em>
          </MenuItem>
          <MenuItem value="SC">SC</MenuItem>
          <MenuItem value="DK">DK</MenuItem>
        </Select>
        <TextField
          placeholder="No."
          size="small"
          value={val.session}
          onChange={(e) => {
            const next = { ...val, session: e.target.value.replace(/\D/g, '') };
            setVal(next);
          }}
          onBlur={() => commit(val)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit(val);
              e.currentTarget.blur();
            }
          }}
          sx={{
            width: 52,
            '& .MuiInputBase-root': {
              height: 28,
              fontSize: 'inherit',
              borderRadius: 1.25,
              px: 0.75,
            },
            '& .MuiInputBase-input': { py: 0.25 },
          }}
        />
      </Stack>
    );
  };

  // ---------- Contract Signing editor ----------
  const ContractSigningEditor = ({ row }) => {
    const value = /^\d{4}-\d{2}-\d{2}$/.test(row.contractSigning || '')
      ? row.contractSigning
      : '';
    const handle = (e) => {
      const v = e.target.value;
      updateApplication(row.email, { contractSigning: v || 'Pending' });
    };
    return (
      <TextField
        type="date"
        size="small"
        value={value}
        onChange={handle}
        sx={{
          ml: -0.5,
          minWidth: 120,
          '& .MuiInputBase-root': {
            height: 28,
            fontSize: 'inherit',
            borderRadius: 1.25,
            px: 0.75,
          },
          '& .MuiInputBase-input': { py: 0.25 },
        }}
      />
    );
  };

  // ---------- DCC editor ----------
  const DccEditor = ({ row }) => {
    const current = row.dcc || 'Need to Review';
    const handle = (e) => updateApplication(row.email, { dcc: e.target.value });
    return (
      <Select
        value={current}
        onChange={handle}
        input={
          <OutlinedInput
            size="small"
            sx={{
              height: 28,
              borderRadius: 1.25,
              fontSize: 'inherit',
              pr: 2.25,
              '& .MuiOutlinedInput-input': { p: 0.25 },
            }}
          />
        }
        MenuProps={{ MenuListProps: { dense: true } }}
        sx={{
          minWidth: 150,
          '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
          '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
        }}
      >
        {DCC_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    );
  };

  // Header styles
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

  const returnToPhase1 = (email) =>
    updateApplication(email, {
      bgc: 'Pending',
      training: null,
      contractSigning: 'Pending',
      dcc: null,
    });

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
        title="Phase 2"
        rows={filtered}
        cols={colsPhase2}
        onActivate={(email) => activateDriver(email)}
        onRemove={(email) => setRemoveFor(email)}
        onReturnToPhase1={(email) => returnToPhase1(email)}
        renderCell={(row, label) => {
          if (label === 'Station') return row.station || row.depot || '-';
          if (label === 'Background Check') return <BackgroundCheckEditor row={row} />;
          if (label === 'Training') return <TrainingEditor row={row} />;
          if (label === 'Contract Signing') return <ContractSigningEditor row={row} />;
          if (label === 'DCC') return <DccEditor row={row} />;
          return undefined;
        }}
      />
    </Box>
  );
}

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
  Popover,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

const BGC_OPTIONS = ['—', 'Not Applied', 'Pending', 'Pass', 'Fail'];
const DCC_OPTIONS = ['—', 'Need to Review', 'Complete'];
const TEST_RESULT_OPTIONS = ['Pass', 'Fail'];

// ---------- Editors extracted outside to avoid remount on parent re-render ----------

const BackgroundCheckEditor = React.memo(({ row, updateApplication }) => {
  const current = row.bgc === 'In Review' ? 'Pending' : row.bgc || '—';
  const handleChange = (e) => updateApplication(row.email, { bgc: e.target.value });
  return (
    <Select
      value={current}
      onChange={handleChange}
      input={
        <OutlinedInput
          size="small"
          sx={{
            height: 28, borderRadius: 1.25, fontSize: 'inherit', pr: 2.25,
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
        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
      ))}
    </Select>
  );
});

const TrainingEditor = React.memo(({ row, updateApplication }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [newDate, setNewDate] = React.useState('');
  const [newTime, setNewTime] = React.useState('');
  const [msg, setMsg] = React.useState(row.trainingMessage || '');
  const slots = row.trainingSlots || [];
  const bookedSlot = row.trainingBooked;

  React.useEffect(() => setMsg(row.trainingMessage || ''), [row.trainingMessage]);

  const addSlot = () => {
    if (!newDate || !newTime) return;
    const exists = slots.some((s) => s.date === newDate && s.time === newTime);
    if (exists) return;
    const updated = [...slots, { date: newDate, time: newTime }].sort(
      (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
    );
    updateApplication(row.email, { trainingSlots: updated });
    setNewDate('');
    setNewTime('');
  };

  const removeSlot = (idx) => {
    const updated = slots.filter((_, i) => i !== idx);
    updateApplication(row.email, { trainingSlots: updated });
  };

  const commitMessage = () => {
    if ((row.trainingMessage || '') !== msg) {
      updateApplication(row.email, { trainingMessage: msg });
    }
  };

  const formatSlot = (s) => {
    const d = new Date(s.date + 'T00:00');
    const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${day} ${s.time}`;
  };

  const rebook = () => {
    updateApplication(row.email, { trainingBooked: null, trainingSlots: [], trainingMessage: '' });
  };

  if (bookedSlot) {
    return (
      <>
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
          <Chip
            icon={<EventIcon />}
            label={`Requested: ${formatSlot(bookedSlot)}`}
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ cursor: 'pointer', bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 600, '& .MuiChip-icon': { color: '#2563EB' } }}
          />
          <Chip
            label="Rebook"
            size="small"
            onClick={rebook}
            sx={{ cursor: 'pointer', bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }}
          />
        </Stack>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => { commitMessage(); setAnchorEl(null); }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { p: 2, minWidth: 300, maxWidth: 380 } }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Requested: {formatSlot(bookedSlot)}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Message for candidate</Typography>
          <TextField
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            size="small"
            placeholder="Type your message and close to save..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onBlur={commitMessage}
            sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
          />
        </Popover>
      </>
    );
  }

  return (
    <>
      <Chip
        icon={<EventIcon sx={{ fontSize: 14 }} />}
        label={slots.length ? `${slots.length} slot${slots.length > 1 ? 's' : ''}` : 'Set slots'}
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          cursor: 'pointer',
          bgcolor: slots.length ? '#EFF6FF' : '#FEF3C7',
          color: slots.length ? '#2563EB' : '#92400E',
          fontWeight: 600,
          '& .MuiChip-icon': { color: slots.length ? '#2563EB' : '#92400E' },
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { commitMessage(); setAnchorEl(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, minWidth: 300, maxWidth: 380 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Online Training Slots</Typography>
        {slots.map((s, i) => (
          <Stack key={`${s.date}${s.time}`} direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2">{formatSlot(s)}</Typography>
            <IconButton size="small" onClick={() => removeSlot(i)}><DeleteOutlineIcon fontSize="small" /></IconButton>
          </Stack>
        ))}
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TextField type="date" size="small" value={newDate} onChange={(e) => setNewDate(e.target.value)}
            sx={{ flex: 1, '& .MuiInputBase-root': { height: 28, fontSize: 12 } }} />
          <TextField type="time" size="small" value={newTime} onChange={(e) => setNewTime(e.target.value)}
            sx={{ width: 90, '& .MuiInputBase-root': { height: 28, fontSize: 12 } }} />
          <IconButton size="small" onClick={addSlot} color="primary"><AddCircleOutlineIcon fontSize="small" /></IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Message for candidate</Typography>
        <TextField
          multiline
          minRows={2}
          maxRows={5}
          fullWidth
          size="small"
          placeholder="e.g. Please bring your ID and wear comfortable shoes..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onBlur={commitMessage}
          sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
        />
      </Popover>
    </>
  );
});

const SafetyTrainingEditor = React.memo(({ row, updateApplication }) => {
  const value = /^\d{4}-\d{2}-\d{2}$/.test(row.safetyTraining || '') ? row.safetyTraining : '';
  const handle = (e) => {
    updateApplication(row.email, { safetyTraining: e.target.value || '' });
  };
  return (
    <TextField
      type="date"
      size="small"
      value={value}
      onChange={handle}
      sx={{
        ml: -0.5, minWidth: 120,
        '& .MuiInputBase-root': { height: 28, fontSize: 'inherit', borderRadius: 1.25, px: 0.75 },
        '& .MuiInputBase-input': { py: 0.25 },
      }}
    />
  );
});

const DrivingTestEditor = React.memo(({ row, updateApplication }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [newDate, setNewDate] = React.useState('');
  const [newTime, setNewTime] = React.useState('');
  const slots = row.drivingTestSlots || [];

  let bookedSlot = null;
  try {
    const parsed = JSON.parse(row.contractSigning || '');
    if (parsed && parsed.date && parsed.time) bookedSlot = parsed;
  } catch { /* not booked */ }

  const addSlot = () => {
    if (!newDate || !newTime) return;
    const exists = slots.some((s) => s.date === newDate && s.time === newTime);
    if (exists) return;
    const updated = [...slots, { date: newDate, time: newTime }].sort(
      (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
    );
    updateApplication(row.email, { drivingTestSlots: updated });
    setNewDate('');
    setNewTime('');
  };

  const removeSlot = (idx) => {
    const updated = slots.filter((_, i) => i !== idx);
    updateApplication(row.email, { drivingTestSlots: updated });
  };

  const formatSlot = (s) => {
    const d = new Date(s.date + 'T00:00');
    const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${day} ${s.time}`;
  };

  const rebook = () => {
    updateApplication(row.email, { contractSigning: 'Pending', drivingTestSlots: [], drivingTestResult: '' });
  };

  if (bookedSlot) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
        <Chip
          icon={<CheckCircleIcon />}
          label={formatSlot(bookedSlot)}
          size="small"
          sx={{ bgcolor: '#DCFCE7', color: '#065F46', fontWeight: 600, '& .MuiChip-icon': { color: '#065F46' } }}
        />
        <Chip
          label="Rebook"
          size="small"
          onClick={rebook}
          sx={{ cursor: 'pointer', bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }}
        />
      </Stack>
    );
  }

  return (
    <>
      <Chip
        icon={<EventIcon sx={{ fontSize: 14 }} />}
        label={slots.length ? `${slots.length} slot${slots.length > 1 ? 's' : ''}` : 'Set slots'}
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          cursor: 'pointer',
          bgcolor: slots.length ? '#EFF6FF' : '#FEF3C7',
          color: slots.length ? '#2563EB' : '#92400E',
          fontWeight: 600,
          '& .MuiChip-icon': { color: slots.length ? '#2563EB' : '#92400E' },
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, minWidth: 280, maxWidth: 340 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Driving Test + Safety Training Slots</Typography>
        {slots.length === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            No slots added yet
          </Typography>
        )}
        {slots.map((s, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
            <Typography variant="body2">{formatSlot(s)}</Typography>
            <IconButton size="small" onClick={() => removeSlot(i)} sx={{ color: '#EF4444' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={0.5} alignItems="center">
          <TextField
            type="date"
            size="small"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            sx={{ flex: 1, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
          />
          <TextField
            type="time"
            size="small"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            sx={{ width: 90, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
          />
          <IconButton size="small" onClick={addSlot} disabled={!newDate || !newTime} color="primary">
            <AddCircleOutlineIcon />
          </IconButton>
        </Stack>
      </Popover>
    </>
  );
});

const DccEditor = React.memo(({ row, updateApplication }) => {
  const current = row.dcc || '—';
  const handle = (e) => updateApplication(row.email, { dcc: e.target.value });
  return (
    <Select
      value={current}
      onChange={handle}
      input={
        <OutlinedInput
          size="small"
          sx={{
            height: 28, borderRadius: 1.25, fontSize: 'inherit', pr: 2.25,
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
        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
      ))}
    </Select>
  );
});

const TestResultEditor = React.memo(({ row, updateApplication }) => {
  const current = row.drivingTestResult || '';
  const handle = (e) => updateApplication(row.email, { drivingTestResult: e.target.value });
  if (!current) {
    return (
      <Select
        value=""
        displayEmpty
        onChange={handle}
        input={
          <OutlinedInput
            size="small"
            sx={{
              height: 28, borderRadius: 1.25, fontSize: 'inherit', pr: 2.25,
              '& .MuiOutlinedInput-input': { p: 0.25 },
            }}
          />
        }
        MenuProps={{ MenuListProps: { dense: true } }}
        sx={{
          minWidth: 100,
          '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
          '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
        }}
      >
        <MenuItem value="" disabled><em>—</em></MenuItem>
        {TEST_RESULT_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>
    );
  }
  return (
    <Chip
      icon={current === 'Pass' ? <CheckCircleIcon /> : undefined}
      label={current}
      size="small"
      onClick={() => updateApplication(row.email, { drivingTestResult: '' })}
      sx={{
        cursor: 'pointer',
        bgcolor: current === 'Pass' ? '#DCFCE7' : '#FEE2E2',
        color: current === 'Pass' ? '#065F46' : '#991B1B',
        fontWeight: 600,
        '& .MuiChip-icon': { color: current === 'Pass' ? '#065F46' : '#991B1B' },
      }}
    />
  );
});

const TRAINING_RESULT_OPTIONS = ['Complete', 'Not Complete'];

const TrainingResultEditor = React.memo(({ row, updateApplication }) => {
  const current = row.trainingResult || '';
  const handle = (e) => updateApplication(row.email, { trainingResult: e.target.value });
  if (!current) {
    return (
      <Select
        value=""
        displayEmpty
        onChange={handle}
        input={
          <OutlinedInput
            size="small"
            sx={{
              height: 28, borderRadius: 1.25, fontSize: 'inherit', pr: 2.25,
              '& .MuiOutlinedInput-input': { p: 0.25 },
            }}
          />
        }
        MenuProps={{ MenuListProps: { dense: true } }}
        sx={{
          minWidth: 130,
          '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
          '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
        }}
      >
        <MenuItem value="" disabled><em>—</em></MenuItem>
        {TRAINING_RESULT_OPTIONS.map((opt) => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </Select>
    );
  }
  return (
    <Chip
      icon={current === 'Complete' ? <CheckCircleIcon /> : undefined}
      label={current}
      size="small"
      onClick={() => updateApplication(row.email, { trainingResult: '' })}
      sx={{
        cursor: 'pointer',
        bgcolor: current === 'Complete' ? '#DCFCE7' : '#FEE2E2',
        color: current === 'Complete' ? '#065F46' : '#991B1B',
        fontWeight: 600,
        '& .MuiChip-icon': { color: current === 'Complete' ? '#065F46' : '#991B1B' },
      }}
    />
  );
});

// Static style objects (extracted to avoid re-creation on every render)
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
  const deferredQuery = React.useDeferredValue(query);
  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return phase2;
    return phase2.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [phase2, deferredQuery]);

  // Editors extracted outside component — see above

  const returnToPhase1 = (email) =>
    updateApplication(email, {
      preDCC: 'In Review',
      dlVerification: 'Pending',
      bgc: 'Pending',
      training: null,
      contractSigning: 'Pending',
      drivingTestSlots: [],
      drivingTestResult: '',
      trainingSlots: [],
      trainingMessage: '',
      trainingBooked: null,
      trainingResult: '',
      dcc: null,
      flexConfirmed: false,
      dlConfirmed: false,
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
        profilePathFor={(r) => `/admin/drivers/${encodeURIComponent(r.email)}`}
        documentsPathFor={(r) => `/admin/drivers/${encodeURIComponent(r.email)}/documents`}
        renderCell={(row, label) => {
          if (label === 'Station') return row.station || row.depot || '-';
          if (label === 'Driving Test + Safety Training') return <DrivingTestEditor row={row} updateApplication={updateApplication} />;
          if (label === 'Test Result') return <TestResultEditor row={row} updateApplication={updateApplication} />;
          if (label === 'Background Check') return <BackgroundCheckEditor row={row} updateApplication={updateApplication} />;
          if (label === 'Online Training') return <TrainingEditor row={row} updateApplication={updateApplication} />;
          if (label === 'Training Result') return <TrainingResultEditor row={row} updateApplication={updateApplication} />;
          if (label === 'DCC') return <DccEditor row={row} updateApplication={updateApplication} />;
          return undefined;
        }}
        paginate
        rowsPerPageOptions={[25, 50, 100]}
        defaultRowsPerPage={25}
      />
    </Box>
  );
}

// src/pages/Recruitment/OnboardingPhase1.jsx
import * as React from 'react';
import {
  Box, Paper, TextField, InputAdornment, Chip, Stack,
  Select, MenuItem, OutlinedInput,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormGroup, FormControlLabel, Checkbox, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';
import PhaseTable from '../../components/common/PhaseTable';

const PREDCC_OPTIONS = ['In Review', 'FIR', 'Complete', 'DMR'];
const DL_OPTIONS = ['Pending', 'Pass', 'Fail'];
const DOC_CATEGORIES = ['Licence', 'Identification', 'Right to Work', 'National Insurance', 'VAT', 'Proof of Address'];

// Account ID — extracted outside to avoid remount on parent re-render
const accountIdSx = {
  ml: -1,
  width: 220,
  '& .MuiOutlinedInput-notchedOutline': { borderRadius: 1.25 },
  '& .MuiInputBase-root': { height: 28, fontSize: 'inherit', px: 1 },
};
const AccountIdEditor = React.memo(({ row, updateApplication }) => {
  const initial = row.accountId || '';
  const [local, setLocal] = React.useState(initial);
  const focused = React.useRef(false);
  React.useEffect(() => { if (!focused.current) setLocal(initial); }, [initial]);
  const commit = () => {
    const next = (local || '').trim();
    if ((row.accountId || '') !== next) updateApplication(row.email, { accountId: next });
  };
  return (
    <TextField
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; commit(); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { commit(); e.currentTarget.blur(); } }}
      placeholder="Enter Account ID"
      variant="outlined"
      size="small"
      sx={accountIdSx}
    />
  );
});

// DL Verification — extracted outside to avoid remount on parent re-render
const dlSelectInputSx = {
  height: 28, borderRadius: 1.25, fontSize: 'inherit', pr: 3,
  '& .MuiOutlinedInput-input': { p: 0 },
};
const dlSelectSx = {
  minWidth: 108,
  '& .MuiSelect-select': { py: 0, px: 1, minHeight: 'unset' },
  '& .MuiSelect-icon': { fontSize: 18, mr: 0.25 },
};
const DlVerificationEditor = React.memo(({ row, updateApplication }) => {
  const value = row.dlVerification || 'Pending';
  const handleChange = (e) => {
    const next = e.target.value;
    const patch = { dlVerification: next };
    // When DL passes and Pre-DCC is already Complete, auto-set bgc to '—' for Phase 2
    if (next === 'Pass' && row.preDCC === 'Complete' && (!row.bgc || row.bgc === 'Pending')) {
      patch.bgc = '—';
    }
    updateApplication(row.email, patch);
  };
  return (
    <Select
      value={value}
      onChange={handleChange}
      input={<OutlinedInput size="small" sx={dlSelectInputSx} />}
      MenuProps={{ MenuListProps: { dense: true } }}
      sx={dlSelectSx}
    >
      {DL_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
      ))}
    </Select>
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

export default function OnboardingPhase1() {
  const {
    phase1, phase2, colsPhase1, setRemoveFor,
    phase1Count, phase2Count,
  } = useOutletContext();
  const { updateApplication, documents } = useAppStore();

  // Search
  const [query, setQuery] = React.useState('');
  const deferredQuery = React.useDeferredValue(query);
  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return phase1;
    return phase1.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [phase1, deferredQuery]);

  // FIR dialog state
  const [firDialog, setFirDialog] = React.useState({ open: false, email: null });
  const [firChecked, setFirChecked] = React.useState([]);

  const openFirDialog = (email, existing) => {
    setFirChecked(existing || []);
    setFirDialog({ open: true, email });
  };
  const closeFirDialog = () => setFirDialog({ open: false, email: null });
  const toggleFirDoc = (cat) =>
    setFirChecked((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const confirmFir = () => {
    if (firDialog.email) {
      updateApplication(firDialog.email, { preDCC: 'FIR', firMissingDocs: firChecked });
    }
    closeFirDialog();
  };

  // Build a lookup: email -> { type -> latest uploadedAt }
  const docsByEmail = React.useMemo(() => {
    const map = {};
    for (const doc of documents) {
      if (!doc.driverEmail) continue;
      if (!map[doc.driverEmail]) map[doc.driverEmail] = {};
      const prev = map[doc.driverEmail][doc.type];
      // Keep the latest upload date for each type
      if (!prev || (doc.uploadedAt && doc.uploadedAt > prev)) {
        map[doc.driverEmail][doc.type] = doc.uploadedAt || null;
      }
    }
    return map;
  }, [documents]);

  // Pre-DCC
  const PreDccEditor = ({ row }) => {
    const value = row.preDCC || 'In Review';
    const handleChange = (e) => {
      const next = e.target.value;
      if (next === 'FIR') {
        openFirDialog(row.email, row.firMissingDocs || []);
      } else {
        const patch = { preDCC: next, firMissingDocs: [] };
        // When Pre-DCC completes and DL is already Pass, auto-set bgc to '—' for Phase 2
        if (next === 'Complete' && row.dlVerification === 'Pass' && (!row.bgc || row.bgc === 'Pending')) {
          patch.bgc = '—';
        }
        updateApplication(row.email, patch);
      }
    };
    const firDocs = row.firMissingDocs || [];
    const driverDocs = docsByEmail[row.email] || {};
    const firSetAt = row.updatedAt || null; // when FIR was set
    return (
      <Box>
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
        {value === 'FIR' && firDocs.length > 0 && (
          <Stack direction="column" spacing={0.25} sx={{ mt: 0.5 }}>
            {firDocs.map((cat) => {
              // Only count as uploaded if document was uploaded AFTER FIR was set
              const latestUpload = driverDocs[cat] || null;
              const done = latestUpload && firSetAt
                && new Date(latestUpload).getTime() > new Date(firSetAt).getTime();
              return (
                <Box key={cat} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {done
                    ? <CheckCircleIcon sx={{ fontSize: 13, color: 'success.main' }} />
                    : <HourglassEmptyIcon sx={{ fontSize: 13, color: '#d4a017' }} />
                  }
                  <Typography variant="caption" sx={{ fontSize: 10, lineHeight: 1.2, color: done ? 'success.main' : '#d4a017' }}>
                    {cat}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    );
  };

  // Account ID — component extracted above (outside render) to prevent remount

  // DL Verification
  // DlVerificationEditor — component extracted above (outside render) to prevent remount

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
        onProceed={(email) => updateApplication(email, { bgc: '—' })}
        onRemove={(email) => setRemoveFor(email)}
        profilePathFor={(r) => `/admin/drivers/${encodeURIComponent(r.email)}`}
        documentsPathFor={(r) => `/admin/drivers/${encodeURIComponent(r.email)}/documents`}
        renderCell={(row, label) => {
          if (label === 'Pre-DCC') return <PreDccEditor row={row} />;
          if (label === 'Account ID') return <AccountIdEditor row={row} updateApplication={updateApplication} />;
          if (label === 'Flex') return row.flexConfirmed
            ? <Chip label="Confirmed" size="small" icon={<CheckCircleIcon />} sx={{ bgcolor: '#DCFCE7', color: '#065F46', fontWeight: 600, '& .MuiChip-icon': { color: '#065F46' } }} />
            : <Chip label="Pending" size="small" icon={<HourglassEmptyIcon />} sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600, '& .MuiChip-icon': { color: '#92400E' } }} />;
          if (label === 'DL Verification') return <DlVerificationEditor row={row} updateApplication={updateApplication} />;
          if (label === 'Station') return row.station || row.depot || '-';
          return undefined;
        }}
        paginate
        rowsPerPageOptions={[25, 50, 100]}
        defaultRowsPerPage={25}
      />

      {/* FIR missing documents dialog */}
      <Dialog open={firDialog.open} onClose={closeFirDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Select Missing Documents</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Which documents are missing or need re-uploading?
          </Typography>
          <FormGroup>
            {DOC_CATEGORIES.map((cat) => (
              <FormControlLabel
                key={cat}
                control={
                  <Checkbox
                    checked={firChecked.includes(cat)}
                    onChange={() => toggleFirDoc(cat)}
                    size="small"
                  />
                }
                label={cat}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFirDialog} size="small">Cancel</Button>
          <Button onClick={confirmFir} variant="contained" size="small" disabled={firChecked.length === 0}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

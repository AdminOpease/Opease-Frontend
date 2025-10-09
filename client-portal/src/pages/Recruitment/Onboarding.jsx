// client-portal/src/pages/Recruitment/Onboarding.jsx
import * as React from 'react';
import {
  Box, Button, Stack, TextField, Tabs, Tab, Typography,
  IconButton, Menu, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';

export default function Onboarding() {
  const { applications, activateDriver, removeDriver, depots = [] } = useAppStore();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const depotOptions = React.useMemo(() => [ALL, ...depots], [depots]);
  const [depot, setDepot] = React.useState(ALL);
  const [depotEl, setDepotEl] = React.useState(null);

  const base = React.useMemo(() => applications.filter((a) => !a.removedAt), [applications]);

  const phase1Raw = base.filter(
    (a) =>
      a.bgc === 'Pending' &&
      !a.training &&
      a.contractSigning !== 'Complete' &&
      !a.dcc
  );
  const phase2Raw = base.filter(
    (a) =>
      !(
        a.bgc === 'Pending' &&
        !a.training &&
        a.contractSigning !== 'Complete' &&
        !a.dcc
      )
  );

  const matchesDepot = (a) =>
    depot === ALL ? true : a.depot === depot || a.station === depot;

  const phase1 = React.useMemo(() => phase1Raw.filter(matchesDepot), [phase1Raw, depot]);
  const phase2 = React.useMemo(() => phase2Raw.filter(matchesDepot), [phase2Raw, depot]);

  const colsPhase1 = [
    'Date Applied',
    'Station',
    'Full Name',
    'Phone',
    'Pre-DCC',
    'Account ID',
    'DL Verification',
  ];

  // CHANGED: "BGC" -> "Background Check"
  const colsPhase2 = [
    'Date Applied',
    'Station',
    'Full Name',
    'Phone',
    'Background Check',
    'Training',
    'Contract Signing',
    'DCC',
  ];

  const tabIndex = pathname.endsWith('/phase-2') ? 1 : 0;

  const [removeFor, setRemoveFor] = React.useState(null);
  const [removeComment, setRemoveComment] = React.useState('');
  const doRemove = () => {
    if (!removeFor) return;
    removeDriver(removeFor, removeComment.trim());
    setRemoveFor(null);
    setRemoveComment('');
  };

  const depotBtnSx = {
    borderRadius: 9999,
    px: 2,
    minHeight: 34,
    border: '1px solid',
    borderColor: 'rgba(46,76,30,0.35)',
    color: 'primary.main',
    fontWeight: 700,
    '&:hover': { borderColor: 'primary.main', backgroundColor: 'transparent' },
  };
  const menuPaperSx = {
    mt: 0.5,
    minWidth: 200,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  };
  const navLikeItemSx = {
    justifyContent: 'center',
    textAlign: 'center',
    px: 2,
    py: 0.9,
    fontSize: 14,
    lineHeight: 1.25,
    '&:hover': { backgroundColor: 'action.hover' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, i) => nav(i === 0 ? 'phase-1' : 'phase-2')}>
          <Tab label="PHASE 1" />
          <Tab label="PHASE 2" />
        </Tabs>

        <IconButton onClick={(e) => setDepotEl(e.currentTarget)} sx={depotBtnSx}>
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
          MenuListProps={{ dense: true, sx: { py: 0 } }}
        >
          {depotOptions.map((d) => (
            <MenuItem key={d} onClick={() => { setDepot(d); setDepotEl(null); }} sx={navLikeItemSx}>
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Outlet
        context={{
          phase1,
          phase2,
          colsPhase1,
          colsPhase2,
          activateDriver,
          setRemoveFor,
          phase1Count: phase1.length,
          phase2Count: phase2.length,
        }}
      />

      {removeFor && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography sx={{ mb: 1, fontWeight: 700 }}>Remove application</Typography>
          <TextField
            label="Comment (optional)"
            size="small"
            fullWidth
            value={removeComment}
            onChange={(e) => setRemoveComment(e.target.value)}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" color="error" onClick={doRemove}>Remove</Button>
            <Button variant="text" onClick={() => { setRemoveFor(null); setRemoveComment(''); }}>Cancel</Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

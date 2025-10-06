// src/pages/Recruitment/Onboarding.jsx
import * as React from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';

export default function Onboarding() {
  const { applications, activateDriver, removeDriver } = useAppStore();
  const nav = useNavigate();
  const { pathname } = useLocation();

  // ----- Depot selector (same look/feel as Drivers page) -----
  const depots = React.useMemo(
    () => [ALL, ...Array.from(new Set(applications.map(a => a.depot).filter(Boolean)))],
    [applications]
  );
  const [depot, setDepot] = React.useState(ALL);
  const [depotEl, setDepotEl] = React.useState(null);

  // Filter apps by depot
  const byDepot = React.useMemo(
    () => (depot === ALL ? applications : applications.filter(a => a.depot === depot)),
    [applications, depot]
  );

  // ----- Phase lists (unchanged logic, now applied to depot-filtered set) -----
  const phaseBase = React.useMemo(
    () => byDepot.filter(a => !a.removedAt),
    [byDepot]
  );

  const phase1 = React.useMemo(
    () =>
      phaseBase.filter(
        a => a.bgc === 'Pending' && !a.training && a.contractSigning !== 'Complete' && !a.dcc
      ),
    [phaseBase]
  );

  const phase2 = React.useMemo(
    () =>
      phaseBase.filter(
        a =>
          !(
            a.bgc === 'Pending' &&
            !a.training &&
            a.contractSigning !== 'Complete' &&
            !a.dcc
          )
      ),
    [phaseBase]
  );

  const colsPhase1 = ['Date Applied','Full Name','Phone','Pre-DCC','Account ID','DL Verification'];
  const colsPhase2 = ['Date Applied','Full Name','Phone','BGC','Training','Contract Signing','DCC'];

  // tabs reflect URL
  const tabIndex = pathname.endsWith('/phase-2') ? 1 : 0;

  // removal confirm (kept global)
  const [removeFor, setRemoveFor] = React.useState(null);
  const [removeComment, setRemoveComment] = React.useState('');

  const doRemove = () => {
    if (!removeFor) return;
    removeDriver(removeFor, removeComment.trim());
    setRemoveFor(null);
    setRemoveComment('');
  };

  // ---- styles pulled from Drivers page for visual parity ----
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
  const menuListSx = { py: 0 };
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
      {/* Header row: Tabs (left) + Depot selector (right) */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, i) => nav(i === 0 ? 'phase-1' : 'phase-2')}
          sx={{ minHeight: 40 }}
        >
          <Tab label="PHASE 1" />
          <Tab label="PHASE 2" />
        </Tabs>

        {/* Depot pill (same as Drivers) */}
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
          MenuListProps={{ dense: true, sx: menuListSx }}
        >
          {depots.map((d) => (
            <MenuItem
              key={d}
              onClick={() => { setDepot(d); setDepotEl(null); }}
              sx={navLikeItemSx}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Child pages render content (receive depot-filtered data) */}
      <Outlet
        context={{
          phase1,
          phase2,
          colsPhase1,
          colsPhase2,
          activateDriver,
          setRemoveFor,
        }}
      />

      {/* Global remove confirmation */}
      {removeFor && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography sx={{ mb: 1, fontWeight: 700 }}>
            Remove application
          </Typography>
          <Box
            component="textarea"
            rows={3}
            style={{
              width: '100%',
              borderRadius: 8,
              padding: 8,
              border: '1px solid #e5e7eb',
              fontFamily: 'inherit',
              fontSize: 14,
            }}
            value={removeComment}
            onChange={(e) => setRemoveComment(e.target.value)}
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <button
              onClick={doRemove}
              style={{
                background: '#d32f2f', color: '#fff', border: 0, padding: '6px 12px',
                borderRadius: 8, cursor: 'pointer'
              }}
            >
              Remove
            </button>
            <button
              onClick={() => { setRemoveFor(null); setRemoveComment(''); }}
              style={{
                background: 'transparent', color: '#1f2937', border: 0, padding: '6px 12px',
                borderRadius: 8, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

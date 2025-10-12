// client-portal/src/pages/Recruitment/Onboarding.jsx
import * as React from 'react';
import {
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';

export default function Onboarding() {
  const { applications, activateDriver, removeDriver, depots = [] } = useAppStore();
  const nav = useNavigate();
  const { pathname } = useLocation();

  // Depot filter (shared across both phases)
  const depotOptions = React.useMemo(() => [ALL, ...depots], [depots]);
  const [depot, setDepot] = React.useState(ALL);
  const [depotEl, setDepotEl] = React.useState(null);

  // Unremoved apps
  const base = React.useMemo(() => applications.filter((a) => !a.removedAt), [applications]);

  // Phase logic
  const phase1Raw = base.filter(
    (a) => a.bgc === 'Pending' && !a.training && a.contractSigning !== 'Complete' && !a.dcc
  );
  const phase2Raw = base.filter(
    (a) =>
      !(a.bgc === 'Pending' && !a.training && a.contractSigning !== 'Complete' && !a.dcc)
  );

  // Apply depot filter to both
  const byDepot = (arr) =>
    depot === ALL ? arr : arr.filter((a) => (a.station || a.depot) === depot);
  const phase1 = byDepot(phase1Raw);
  const phase2 = byDepot(phase2Raw);

  // Columns
  const colsPhase1 = [
    'Date Applied',
    'Station',
    'Full Name',
    'Phone',
    'Pre-DCC',
    'Account ID',
    'DL Verification',
  ];
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

  // Tabs reflect URL
  const tabIndex = pathname.endsWith('/phase-2') ? 1 : 0;

  // Remove modal
  const [removeFor, setRemoveFor] = React.useState(null);
  const [removeComment, setRemoveComment] = React.useState('');
  const removing = React.useMemo(
    () => applications.find((a) => a.email === removeFor) || null,
    [applications, removeFor]
  );

  const doRemove = () => {
    if (!removeFor) return;
    removeDriver(removeFor, removeComment.trim());
    setRemoveFor(null);
    setRemoveComment('');
  };

  // Styles
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
      {/* Tabs + Depot filter */}
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
            <MenuItem
              key={d}
              onClick={() => {
                setDepot(d);
                setDepotEl(null);
              }}
              sx={navLikeItemSx}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Children get filtered data + actions */}
      <Outlet
        context={{
          phase1,
          phase2,
          colsPhase1,
          colsPhase2,
          activateDriver,
          setRemoveFor, // shows the modal
          phase1Count: phase1.length,
          phase2Count: phase2.length,
        }}
      />

      {/* THEMED REMOVE MODAL (centered single line) */}
      <Dialog
        open={Boolean(removeFor)}
        onClose={() => {
          setRemoveFor(null);
          setRemoveComment('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            backgroundImage:
              'linear-gradient(180deg, rgba(248,249,248,0.92) 0%, rgba(255,255,255,0.98) 100%)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
          },
        }}
        BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.25)' } }}
      >
        <DialogTitle sx={{ px: 5, pb: 1 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: 800, letterSpacing: 0.2 }}
          >
            {removing?.name ? `Removing ${removing.name}` : 'Removing Application'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 5, pt: 0 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Comment (optional)"
            value={removeComment}
            onChange={(e) => setRemoveComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doRemove();
            }}
            sx={{
              mt: 0.75,
              '& .MuiOutlinedInput-root': {
                height: 44,
                borderRadius: 9999, // pill
                bgcolor: 'background.default',
                px: 1.25,
                transition: 'border-color 120ms ease',
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 5, pb: 2 }}>
          <Button
            onClick={() => {
              setRemoveFor(null);
              setRemoveComment('');
            }}
            size="small"
            variant="text"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={doRemove}
            size="small"
            color="error"
            variant="contained"
            sx={{
              borderRadius: 9999,
              px: 2.5,
              boxShadow: '0 2px 0 rgba(0,0,0,0.06)', // softer shadow
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

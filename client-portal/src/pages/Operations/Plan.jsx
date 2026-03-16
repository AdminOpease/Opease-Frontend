// src/pages/Operations/Plan.jsx
import * as React from 'react';
import { Box, Tabs, Tab, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';

const ALL = 'All Depots';

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

export default function Plan() {
  const { depots } = useAppStore();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const depotOptions = React.useMemo(() => [ALL, ...depots], [depots]);
  const [depot, setDepot] = React.useState('DLU2');
  const [depotEl, setDepotEl] = React.useState(null);

  const tabIndex = pathname.endsWith('/pm') ? 1 : 0;

  return (
    <Box>
      {/* Tabs + Depot filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, i) => nav(i === 0 ? 'am' : 'pm')}>
          <Tab label="AM PLAN" />
          <Tab label="PM PLAN" />
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
              onClick={() => { setDepot(d); setDepotEl(null); }}
              sx={navLikeItemSx}
            >
              {d}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Children get shared state */}
      <Outlet context={{ depot, depots }} />
    </Box>
  );
}

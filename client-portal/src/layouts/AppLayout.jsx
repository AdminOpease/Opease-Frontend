// src/layouts/AppLayout.jsx
import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Container, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

function NavLinkText({ to, children, active }) {
  return (
    <Button
      component={Link}
      to={to}
      variant="text"
      sx={{
        mx: 1,
        color: 'text.primary',
        fontWeight: 700,
        borderRadius: 9999,
        ...(active && { borderBottom: '2px solid', borderColor: 'primary.main' }),
      }}
    >
      {children}
    </Button>
  );
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { hasPermission, isSuperAdmin, logout, user } = useAuth();

  // Filter nav items by permission
  const filterByPerm = (items) => items.filter(({ to }) => {
    const key = to.replace(/^\//, ''); // strip leading /
    return hasPermission(key);
  });

  const hasAdmin = hasPermission('admin/drivers') || hasPermission('admin/stations') || hasPermission('admin/expiring-docs');
  const hasOps = hasPermission('operations/rota') || hasPermission('operations/vans') || hasPermission('operations/plan') || hasPermission('operations/working-hours');
  const hasRecruitment = hasPermission('recruitment/onboarding') || hasPermission('recruitment/removed');

  // Menus: admin + operations + recruitment
  const [adminAnchor, setAdminAnchor] = React.useState(null);
  const [opsAnchor, setOpsAnchor] = React.useState(null);
  const [recruitAnchor, setRecruitAnchor] = React.useState(null);
  const adminOpen = Boolean(adminAnchor);
  const opsOpen = Boolean(opsAnchor);
  const recruitOpen = Boolean(recruitAnchor);

  // --- Condensed menu styling ---
  const menuPaperSx = {
    mt: 1,
    minWidth: 200,
    borderRadius: 1.5,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0px 4px 16px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  };
  const menuListSx = { py: 0 };
  const menuItemSx = {
    justifyContent: 'center',
    textAlign: 'center',
    px: 1.5,
    py: 0.75,
    fontSize: 13,
    lineHeight: 1.2,
    '&:hover': { backgroundColor: 'action.hover' },
    '&.Mui-selected': {
      backgroundColor: 'action.selected',
      fontWeight: 600,
    },
    '&.Mui-selected:hover': { backgroundColor: 'action.selected' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', color: 'text.primary' }}>
        <Container maxWidth={false} disableGutters sx={{ pt: 2, pb: 1.5, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Top row: centered logo */}
          <Box
            sx={{
              position: 'relative',
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <img src={Logo} alt="Logo" style={{ height: 100, display: 'block' }} />
          </Box>

          {/* Second row: navigation */}
          <Toolbar disableGutters sx={{ justifyContent: 'center', minHeight: 44, p: 0 }}>
            {/* Admin & Compliance dropdown */}
            {hasAdmin && <Button
              variant={pathname.startsWith('/admin') ? 'contained' : 'outlined'}
              color="primary"
              onClick={(e) => setAdminAnchor(e.currentTarget)}
              endIcon={
                <ExpandMoreIcon
                  sx={{ transition: '0.2s', transform: adminOpen ? 'rotate(180deg)' : 'none' }}
                />
              }
              sx={{
                mx: 1,
                fontWeight: 700,
                borderRadius: 9999, // pill
                px: 2,
                py: 0.75,
                fontSize: 12,
                ...(pathname.startsWith('/admin')
                  ? { color: 'white', borderColor: 'primary.main' }
                  : { borderColor: 'rgba(46,76,30,0.35)' }),
              }}
            >
              Admin &amp; Compliance
            </Button>}

            {hasAdmin && <Menu
              anchorEl={adminAnchor}
              open={adminOpen}
              onClose={() => setAdminAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{ sx: menuPaperSx }}
              MenuListProps={{ dense: true, sx: menuListSx }}
            >
              {filterByPerm([
                { to: '/admin/drivers', label: 'Drivers' },
                { to: '/admin/stations', label: 'Stations' },
                { to: '/admin/expiring-docs', label: 'Expiring Documents' },
              ]).map(({ to, label }) => (
                <MenuItem
                  key={to}
                  component={Link}
                  to={to}
                  onClick={() => setAdminAnchor(null)}
                  selected={pathname === to}
                  sx={menuItemSx}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>}

            {/* Operations dropdown */}
            {hasOps && <Button
              variant={pathname.startsWith('/operations') ? 'contained' : 'outlined'}
              color="primary"
              onClick={(e) => setOpsAnchor(e.currentTarget)}
              endIcon={
                <ExpandMoreIcon
                  sx={{ transition: '0.2s', transform: opsOpen ? 'rotate(180deg)' : 'none' }}
                />
              }
              sx={{
                mx: 1,
                fontWeight: 700,
                borderRadius: 9999,
                px: 2,
                py: 0.75,
                fontSize: 12,
                ...(pathname.startsWith('/operations')
                  ? { color: 'white', borderColor: 'primary.main' }
                  : { borderColor: 'rgba(46,76,30,0.35)' }),
              }}
            >
              Operations
            </Button>}

            {hasOps && <Menu
              anchorEl={opsAnchor}
              open={opsOpen}
              onClose={() => setOpsAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{ sx: menuPaperSx }}
              MenuListProps={{ dense: true, sx: menuListSx }}
            >
              {filterByPerm([
                { to: '/operations/rota', label: 'Rota' },
                { to: '/operations/vans', label: 'Van Assignment' },
                { to: '/operations/plan', label: 'Daily Plan' },
                { to: '/operations/working-hours', label: 'Working Hours' },
              ]).map(({ to, label }) => (
                <MenuItem
                  key={to}
                  component={Link}
                  to={to}
                  onClick={() => setOpsAnchor(null)}
                  selected={pathname === to}
                  sx={menuItemSx}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>}

            {/* Recruitment dropdown */}
            {hasRecruitment && <Button
              variant={pathname.startsWith('/recruitment/') ? 'contained' : 'outlined'}
              color="primary"
              onClick={(e) => setRecruitAnchor(e.currentTarget)}
              endIcon={
                <ExpandMoreIcon
                  sx={{ transition: '0.2s', transform: recruitOpen ? 'rotate(180deg)' : 'none' }}
                />
              }
              sx={{
                mx: 1,
                fontWeight: 700,
                borderRadius: 9999, // pill
                px: 2,
                py: 0.75,
                fontSize: 12,
                ...(pathname.startsWith('/recruitment/')
                  ? { color: 'white', borderColor: 'primary.main' }
                  : { borderColor: 'rgba(46,76,30,0.35)' }),
              }}
            >
              Recruitment
            </Button>}

            {hasRecruitment && <Menu
              anchorEl={recruitAnchor}
              open={recruitOpen}
              onClose={() => setRecruitAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{ sx: menuPaperSx }}
              MenuListProps={{ dense: true, sx: menuListSx }}
            >
              {filterByPerm([
                { to: '/recruitment/onboarding', label: 'Onboarding' },
                { to: '/recruitment/removed', label: 'Removed' },
              ]).map(({ to, label }) => (
                <MenuItem
                  key={to}
                  component={Link}
                  to={to}
                  onClick={() => setRecruitAnchor(null)}
                  selected={pathname === to}
                  sx={menuItemSx}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>}

            {/* Settings (super admin) */}
            {isSuperAdmin && (
              <Tooltip title="User Management">
                <IconButton
                  onClick={() => navigate('/settings/users')}
                  sx={{
                    ml: 1,
                    color: pathname.startsWith('/settings') ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Logout */}
            <Tooltip title={`Logout (${user?.email || ''})`}>
              <IconButton
                onClick={() => { logout(); navigate('/login'); }}
                sx={{ ml: 0.5, color: 'text.secondary' }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flex: 1, width: '100%' }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ pt: 2, pb: 3, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
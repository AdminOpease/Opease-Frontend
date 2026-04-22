// src/layouts/AppLayout.jsx
import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Box, Container, Menu, MenuItem, IconButton, Tooltip,
  Drawer, List, ListItemButton, ListItemText, ListSubheader, Divider, useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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

  // < 600px = phone; collapse nav into a drawer.
  const isMobile = useMediaQuery((t) => t.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  React.useEffect(() => { setDrawerOpen(false); }, [pathname]); // close on nav

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

  // Shared drawer section builder
  const drawerSection = (title, items) => {
    const visible = filterByPerm(items);
    if (visible.length === 0) return null;
    return (
      <React.Fragment key={title}>
        <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 700, color: 'text.primary', lineHeight: 1.6 }}>
          {title}
        </ListSubheader>
        {visible.map(({ to, label }) => (
          <ListItemButton
            key={to}
            component={Link}
            to={to}
            selected={pathname === to || pathname.startsWith(to + '/')}
            sx={{ pl: 3, py: 1.25 }}
          >
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 15 }} />
          </ListItemButton>
        ))}
        <Divider sx={{ my: 0.5 }} />
      </React.Fragment>
    );
  };

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
        <Container maxWidth={false} disableGutters sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Top row: centered logo; hamburger overlaid on mobile */}
          <Box
            sx={{
              position: 'relative',
              height: { xs: 54, sm: 70 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 0, sm: 1 },
            }}
          >
            {isMobile && (
              <IconButton
                aria-label="Open navigation"
                onClick={() => setDrawerOpen(true)}
                sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box
              component="img"
              src={Logo}
              alt="Logo"
              sx={{ height: { xs: 44, sm: 80, md: 100 }, display: 'block', maxWidth: '70%', objectFit: 'contain' }}
            />
            {isMobile && (
              <Tooltip title={`Logout (${user?.email || ''})`}>
                <IconButton
                  onClick={() => { logout(); navigate('/login'); }}
                  sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary' }}
                  size="large"
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Second row: full navigation (desktop only) */}
          {!isMobile && (
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
          )}
        </Container>
      </AppBar>

      {/* Mobile nav drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: '80vw', maxWidth: 320 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5 }}>
          <Box component="img" src={Logo} alt="Logo" sx={{ height: 36 }} />
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List dense={false} sx={{ flex: 1, pt: 0 }}>
          {hasAdmin && drawerSection('Admin & Compliance', [
            { to: '/admin/drivers', label: 'Drivers' },
            { to: '/admin/stations', label: 'Stations' },
            { to: '/admin/expiring-docs', label: 'Expiring Documents' },
          ])}
          {hasOps && drawerSection('Operations', [
            { to: '/operations/rota', label: 'Rota' },
            { to: '/operations/vans', label: 'Van Assignment' },
            { to: '/operations/plan', label: 'Daily Plan' },
            { to: '/operations/working-hours', label: 'Working Hours' },
          ])}
          {hasRecruitment && drawerSection('Recruitment', [
            { to: '/recruitment/onboarding', label: 'Onboarding' },
            { to: '/recruitment/removed', label: 'Removed' },
          ])}
          {isSuperAdmin && (
            <ListItemButton
              component={Link}
              to="/settings/users"
              selected={pathname.startsWith('/settings')}
              sx={{ pl: 2, py: 1.25 }}
            >
              <SettingsIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              <ListItemText primary="User Management" primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
            </ListItemButton>
          )}
        </List>
        <Divider />
        <ListItemButton
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ pl: 2, py: 1.25 }}
        >
          <LogoutIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
          <ListItemText primary="Logout" secondary={user?.email} primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }} />
        </ListItemButton>
      </Drawer>

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
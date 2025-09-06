// src/layouts/AppLayout.jsx
import * as React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Container, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Logo from '../assets/logo.png';

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

  // Menus: recruitment + admin
  const [recruitAnchor, setRecruitAnchor] = React.useState(null);
  const [adminAnchor, setAdminAnchor] = React.useState(null);
  const recruitOpen = Boolean(recruitAnchor);
  const adminOpen = Boolean(adminAnchor);

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
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'transparent', color: 'text.primary' }}>
        <Container maxWidth={false} disableGutters sx={{ py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Top row: centered logo */}
          <Box
            sx={{
              position: 'relative',
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <img src={Logo} alt="Logo" style={{ height: 100, display: 'block' }} />
          </Box>

          {/* Second row: navigation */}
          <Toolbar disableGutters sx={{ justifyContent: 'center', minHeight: 44, p: 0 }}>
            {/* Admin & Compliance dropdown */}
            <Button
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
            </Button>

            <Menu
              anchorEl={adminAnchor}
              open={adminOpen}
              onClose={() => setAdminAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{ sx: menuPaperSx }}
              MenuListProps={{ dense: true, sx: menuListSx }}
            >
              {[
                { to: '/admin/drivers', label: 'Drivers' },
                { to: '/admin/expiring-docs', label: 'Expiring Documents' },
              ].map(({ to, label }) => (
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
            </Menu>

            {/* Recruitment dropdown */}
            <Button
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
            </Button>

            <Menu
              anchorEl={recruitAnchor}
              open={recruitOpen}
              onClose={() => setRecruitAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{ sx: menuPaperSx }}
              MenuListProps={{ dense: true, sx: menuListSx }}
            >
              <MenuItem
                component={Link}
                to="/recruitment/dashboard"
                onClick={() => setRecruitAnchor(null)}
                selected={pathname === '/recruitment/dashboard'}
                sx={menuItemSx}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                component={Link}
                to="/recruitment/onboarding"
                onClick={() => setRecruitAnchor(null)}
                selected={pathname === '/recruitment/onboarding'}
                sx={menuItemSx}
              >
                Onboarding
              </MenuItem>
              <MenuItem
                component={Link}
                to="/recruitment/removed"
                onClick={() => setRecruitAnchor(null)}
                selected={pathname === '/recruitment/removed'}
                sx={menuItemSx}
              >
                Removed
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flex: 1, width: '100%' }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ py: 3, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

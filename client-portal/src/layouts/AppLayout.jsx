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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'transparent', color: 'text.primary' }}>
        <Container maxWidth={false} disableGutters sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Top row: centered logo and sign-in */}
          <Box sx={{ position: 'relative', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={Logo} alt="Logo" style={{ height: 96, display: 'block' }} />
            </Box>

          {/* Second row: navigation */}
          <Toolbar disableGutters sx={{ justifyContent: 'center', minHeight: 44, p: 0 }}>
            <NavLinkText to="/home" active={pathname === '/home'}></NavLinkText>

            {/* Recruitment dropdown */}
            <Button
  variant={pathname.startsWith('/recruitment/') ? 'contained' : 'outlined'}
  color="primary"
  onClick={(e) => setRecruitAnchor(e.currentTarget)}
  endIcon={<ExpandMoreIcon />}
  sx={{
    mx: 1,
    fontWeight: 700,
    borderRadius: 9999,      // pill
    px: 2.25,
    ...(pathname.startsWith('/recruitment/')
      ? { color: 'white', borderColor: 'primary.main' }           // active
      : { borderColor: 'rgba(46,76,30,0.35)' }                    // inactive outline
    ),
  }}
>
  Recruitment
</Button>
            {/* Recruitment dropdown menu */}
<Menu
  anchorEl={recruitAnchor}
  open={Boolean(recruitAnchor)}
  onClose={() => setRecruitAnchor(null)}
>
  <MenuItem component={Link} to="/recruitment/dashboard" onClick={() => setRecruitAnchor(null)}>
    Dashboard
  </MenuItem>
  <MenuItem component={Link} to="/recruitment/onboarding" onClick={() => setRecruitAnchor(null)}>
    Onboarding
  </MenuItem>
  <MenuItem component={Link} to="/recruitment/removed" onClick={() => setRecruitAnchor(null)}>
    Removed
  </MenuItem>
</Menu>


            {/* Admin & Compliance dropdown */}
            <Button
  variant={pathname.startsWith('/admin') ? 'contained' : 'outlined'}
  color="primary"
  onClick={(e) => setAdminAnchor(e.currentTarget)}
  endIcon={<ExpandMoreIcon />}
  sx={{
    mx: 1,
    fontWeight: 700,
    borderRadius: 9999,      // pill
    px: 2.25,
    ...(pathname.startsWith('/admin')
      ? { color: 'white', borderColor: 'primary.main' }           // active
      : { borderColor: 'rgba(46,76,30,0.35)' }                    // inactive outline
    ),
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
            >
              <MenuItem component={Link} to="/admin/dashboard" onClick={() => setAdminAnchor(null)}>
                Dashboard
              </MenuItem>
              <MenuItem component={Link} to="/admin/drivers" onClick={() => setAdminAnchor(null)}>
                Drivers
              </MenuItem>
              <MenuItem component={Link} to="/admin/working-hours" onClick={() => setAdminAnchor(null)}>
                Working Hours
              </MenuItem>
              <MenuItem component={Link} to="/admin/expiring-docs" onClick={() => setAdminAnchor(null)}>
                Expiring Documents
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flex: 1, width: '100%' }}>
        <Container maxWidth={false} disableGutters sx={{ py: 3, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
``

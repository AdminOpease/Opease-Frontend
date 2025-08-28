import * as React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Button, Box, Container, Menu, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Logo from '../assets/logo.png'; // change to .png if needed

function NavLinkText({ to, children, active }) {
  return (
    <Button
      component={Link}
      to={to}
      variant="text"
      sx={{
        mx: 1,
        color: '#333333',
        fontWeight: 700,
        borderRadius: 0,
        ...(active && { borderBottom: '2px solid #2E4C1E' }),
      }}
    >
      {children}
    </Button>
  );
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#E6E6E6', color: '#333333' }}>
        <Container maxWidth={false} disableGutters sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Top row: centered logo and sign-in */}
          <Box sx={{ position: 'relative', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={Logo} alt="Logo" style={{ height: 32, display: 'block' }} />
            <Button component={Link} to="/login" variant="text" sx={{ position: 'absolute', right: 0, color: '#333333', fontWeight: 700 }}>
              Sign in
            </Button>
          </Box>

          {/* Second row: navigation */}
          <Toolbar disableGutters sx={{ justifyContent: 'center', minHeight: 44, p: 0 }}>
            <NavLinkText to="/home" active={pathname === '/home'}>Home</NavLinkText>

            {/* Recruitment dropdown */}
            <Button
              variant="text"
              onClick={(e) => setAnchor(e.currentTarget)}
              endIcon={<ExpandMoreIcon />}
              sx={{
                mx: 1, color: '#333333', fontWeight: 700, borderRadius: 0,
                ...(pathname.startsWith('/recruitment/') && { borderBottom: '2px solid #2E4C1E' }),
              }}
            >
              Recruitment
            </Button>
            <Menu
              anchorEl={anchor}
              open={open}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <MenuItem component={Link} to="/recruitment/onboarding" onClick={() => setAnchor(null)}>
                Onboarding
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

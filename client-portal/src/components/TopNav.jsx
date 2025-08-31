import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Toolbar,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function TopNav() {
  const { pathname } = useLocation();

  const link = (to, label) => (
    <Button
      key={to}
      component={Link}
      to={to}
      variant={pathname === to ? 'contained' : 'text'}
      color="primary"
      sx={{
        mr: 1,
        fontWeight: 700,
        ...(pathname !== to && { color: 'text.primary' }),
      }}
    >
      {label}
    </Button>
  );

  // State for Admin & Compliance dropdown
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <Toolbar>
      {link('/dashboard', 'Dashboard')}
      {link('/documents', 'Documents')}
      {link('/notifications', 'Notifications')}
      {link('/profile', 'Profile')}

      {/* Admin & Compliance dropdown */}
      <Button
        variant={pathname.startsWith('/admin') ? 'contained' : 'text'}
        color="primary"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          mr: 1,
          fontWeight: 700,
          ...(pathname.startsWith('/admin') && { color: 'white' }),
          ...(!pathname.startsWith('/admin') && { color: 'text.primary' }),
        }}
      >
        Admin & Compliance
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 220 } }}
      >
        <MenuItem component={Link} to="/admin/dashboard" onClick={() => setAnchorEl(null)}>
          Dashboard
        </MenuItem>
        <MenuItem component={Link} to="/admin/drivers" onClick={() => setAnchorEl(null)}>
          Drivers
        </MenuItem>
        <MenuItem component={Link} to="/admin/working-hours" onClick={() => setAnchorEl(null)}>
          Working Hours
        </MenuItem>
        <MenuItem component={Link} to="/admin/expiring-docs" onClick={() => setAnchorEl(null)}>
          Expiring Documents
        </MenuItem>
      </Menu>
    </Toolbar>
  );
}

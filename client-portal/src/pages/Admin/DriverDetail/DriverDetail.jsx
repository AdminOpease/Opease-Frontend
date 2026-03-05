// src/pages/Admin/DriverDetail/DriverDetail.jsx
import * as React from 'react';
import { useParams, Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, Typography, Button, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import StatusChip from '../../../components/common/StatusChip';

const TABS = [
  { label: 'Profile', path: 'profile', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
  { label: 'Documents', path: 'documents', icon: <DescriptionIcon sx={{ fontSize: 16 }} /> },
];

const navBtnSx = (active) => ({
  justifyContent: 'flex-start',
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 700,
  px: 1.5,
  gap: 0.75,
  bgcolor: active ? 'primary.main' : '#fff',
  color: active ? '#fff' : 'text.primary',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  '&:hover': {
    bgcolor: active ? 'primary.dark' : '#fff',
    borderColor: 'primary.main',
  },
});

export default function DriverDetailLayout() {
  const { email } = useParams();
  const { pathname } = useLocation();

  // demo only—status hard-coded; later fetch by email
  const status = 'Onboarding';

  return (
    <Box>
      {/* Page header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 1.5 }}>{email}</Typography>
        <StatusChip status={status} />
      </Stack>

      {/* Sidebar + content — both on grey bg */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        {/* Sidebar */}
        <Box sx={{ width: { md: 180 }, flexShrink: 0 }}>
          {/* Nav card */}
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, mb: 1.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
              Driver
            </Typography>
            <Stack spacing={0.75}>
              {TABS.map((tab) => {
                const to = `/admin/drivers/${encodeURIComponent(email)}/${tab.path}`;
                const active = pathname.startsWith(to);
                return (
                  <Button
                    key={tab.path}
                    component={RouterLink}
                    to={to}
                    size="small"
                    sx={navBtnSx(active)}
                    startIcon={tab.icon}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>
          </Paper>

          {/* Status card */}
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
              Status
            </Typography>
            <StatusChip status={status} />
          </Paper>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Stack>
    </Box>
  );
}

// src/pages/Admin/DriverDetail/DriverDetail.jsx
import * as React from 'react';
import { useParams, Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, Typography, Button, Divider, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatusChip from '../../../components/common/StatusChip';
import { useAppStore } from '../../../state/AppStore';
import { drivers as driversApi } from '../../../services/api';

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

  const { drivers } = useAppStore();
  const decodedEmail = decodeURIComponent(email || '');
  const driver = drivers.find((d) => d.email === decodedEmail);
  const status = driver?.status || 'Onboarding';
  const driverName = driver ? [driver.first_name, driver.last_name].filter(Boolean).join(' ') : '';
  const depot = driver?.depot || '—';

  return (
    <Box>
      {/* Page header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mr: 1.5, fontWeight: 700 }}>{driverName || email}</Typography>
        <StatusChip status={status} />
      </Stack>

      {/* Sidebar + content — both on grey bg */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        {/* Sidebar */}
        <Box sx={{ width: { md: 180 }, flexShrink: 0 }}>
          {/* Status & Station card */}
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, mb: 1.5 }}>
            <Stack spacing={1}>
              <Stack direction="column" alignItems="center" spacing={0.5}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Status
                </Typography>
                <StatusChip status={status} />
              </Stack>
              <Divider />
              <Stack direction="column" alignItems="center" spacing={0.5}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Station
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
                  {depot}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Nav card */}
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2 }}>
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

          {/* Invite to Portal */}
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, mt: 1.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
              Candidate Portal
            </Typography>
            {driver?.portal_invited ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                label="Invited"
                size="small"
                sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#E8F5E9', color: '#1B5E20' }}
              />
            ) : (
              <Button
                size="small"
                variant="outlined"
                startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                onClick={async () => {
                  try {
                    await driversApi.invite(driver.id);
                    // Refresh the driver data
                    window.location.reload();
                  } catch (err) {
                    alert('Failed to invite: ' + err.message);
                  }
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 12,
                  borderRadius: 2,
                  width: '100%',
                }}
              >
                Invite to Portal
              </Button>
            )}
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

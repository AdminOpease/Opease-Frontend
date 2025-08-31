// src/pages/Admin/DriverDetail/DriverDetail.jsx
import * as React from 'react';
import { useParams, Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { Box, Paper, Stack, Typography, Button, Divider } from '@mui/material';
import StatusChip from '../../../components/common/StatusChip';

const TABS = [
  { label: 'Profile', path: 'profile' },
  { label: 'Documents', path: 'documents' },
  // Performance & Invoices excluded for now
];

export default function DriverDetailLayout() {
  const { email } = useParams();
  const { pathname } = useLocation();

  // demo only—status hard-coded; later fetch by email
  const status = 'Onboarding';

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ mr: 1 }}>{email}</Typography>
          <StatusChip status={status} />
        </Stack>
      </Stack>

      <Paper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* Left sidebar */}
          <Box sx={{ width: 220, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Driver</Typography>
            <Stack spacing={0.5}>
              {TABS.map(tab => {
                const to = `/admin/drivers/${encodeURIComponent(email)}/${tab.path}`;
                const active = pathname.startsWith(to);
                return (
                  <Button
                    key={tab.path}
                    component={RouterLink}
                    to={to}
                    size="small"
                    variant={active ? 'contained' : 'text'}
                    color="primary"
                    sx={{
                      justifyContent: 'flex-start',
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 1.25,
                      ...(active ? { color: '#fff' } : { color: 'text.primary' }),
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Status selector will live here later (frontend-only for now) */}
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
              Status
            </Typography>
            <StatusChip status={status} />
          </Box>

          {/* Right content */}
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

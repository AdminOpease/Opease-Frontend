// src/pages/Recruitment/Dashboard.jsx
import * as React from 'react';
import { Box, Paper, Typography, Grid, Stack, Chip } from '@mui/material';
import { useAppStore } from '../../state/AppStore.jsx';

export default function RecruitmentDashboard() {
  const { metrics } = useAppStore();
  const pending = metrics.pendingContractSignings();
  const targets = metrics.targets();
  const started = metrics.startedPerWeek();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Recruitment Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: .5 }}>Pending Contract Signings</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{pending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: .5 }}>Targets</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`Weekly: ${targets.weeklyTarget}`} />
              <Chip label={`MTD: ${targets.monthToDate}`} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: .5 }}>Drivers Started per Week</Typography>
            <Stack spacing={0.5}>
              {Object.keys(started).length === 0 ? (
                <Typography sx={{ color: 'text.secondary' }}>No activations yet.</Typography>
              ) : (
                Object.entries(started).map(([wk, n]) => (
                  <Stack key={wk} direction="row" justifyContent="space-between">
                    <Typography>{wk}</Typography><Typography sx={{ fontWeight: 700 }}>{n}</Typography>
                  </Stack>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

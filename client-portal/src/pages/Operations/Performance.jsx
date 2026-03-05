// src/pages/Operations/Performance.jsx
import * as React from 'react';
import { Box, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function Performance() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Performance</Typography>
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
        <BarChartIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Coming soon</Typography>
        <Typography sx={{ fontSize: 12, mt: 0.5 }}>Performance tracking will be available here.</Typography>
      </Box>
    </Box>
  );
}

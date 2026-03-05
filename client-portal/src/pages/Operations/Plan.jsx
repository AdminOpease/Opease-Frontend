// src/pages/Operations/Plan.jsx
import * as React from 'react';
import { Box, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

export default function Plan() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Plan</Typography>
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
        <MapIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Coming soon</Typography>
        <Typography sx={{ fontSize: 12, mt: 0.5 }}>Route and delivery planning will be available here.</Typography>
      </Box>
    </Box>
  );
}

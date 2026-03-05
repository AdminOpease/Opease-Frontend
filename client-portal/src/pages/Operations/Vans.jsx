// src/pages/Operations/Vans.jsx
import * as React from 'react';
import { Box, Typography } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function Vans() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Vans</Typography>
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
        <LocalShippingIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Coming soon</Typography>
        <Typography sx={{ fontSize: 12, mt: 0.5 }}>Van management will be available here.</Typography>
      </Box>
    </Box>
  );
}

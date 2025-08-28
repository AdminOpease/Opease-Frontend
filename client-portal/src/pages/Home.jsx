import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function Home() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Home</Typography>
      <Paper>
        <Typography variant="body1">
          Welcome. This page will surface important info later.
        </Typography>
      </Paper>
    </Box>
  );
}

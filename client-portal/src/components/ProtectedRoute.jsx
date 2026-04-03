import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ pageKey, children }) {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (pageKey && !hasPermission(pageKey)) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#D32F2F' }}>Access Denied</Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>You don't have permission to view this page.</Typography>
      </Box>
    );
  }

  return children;
}

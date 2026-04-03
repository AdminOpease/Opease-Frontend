import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={Logo} alt="OpEase" style={{ height: 80, display: 'block', margin: '0 auto' }} />
        </Box>

        <Paper sx={{ borderRadius: 3, p: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 20, textAlign: 'center', mb: 3 }}>
            Staff Portal
          </Typography>

          <form onSubmit={handleSubmit}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Email</Typography>
            <TextField
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@opease.co.uk"
              sx={{ mb: 2 }}
            />

            <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Password</Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            {error && (
              <Typography sx={{ color: '#D32F2F', fontSize: 13, textAlign: 'center', mb: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !email || !password}
              sx={{
                bgcolor: '#2E4C1E', py: 1.2, fontWeight: 700, fontSize: 15,
                borderRadius: 2, textTransform: 'none',
                '&:hover': { bgcolor: '#3d6528' },
              }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}

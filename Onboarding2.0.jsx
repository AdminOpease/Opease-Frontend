// src/pages/Recruitment/Onboarding.jsx
import * as React from 'react';
import { Box, Typography, Paper, Grid, Button, Stack, Menu, MenuItem, TextField } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/AppStore.jsx';

function RowActions({ email, onActivate, onRemove }) {
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  return (
    <>
      <Button size="small" variant="text" onClick={(e) => setAnchor(e.currentTarget)}><MoreVertIcon /></Button>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); onActivate(email); }}>Activate</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onRemove(email); }}>Remove…</MenuItem>
      </Menu>
    </>
  );
}

export default function Onboarding() {
  const { applications, activateDriver, removeDriver, metrics } = useAppStore();
  const nav = useNavigate();

  const today = metrics.receivedToday();
  const phase1 = applications.filter(a => !a.removedAt).filter(a => (a.bgc === 'Pending' && !a.training && a.contractSigning !== 'Complete' && !a.dcc));
  const phase2 = applications.filter(a => !a.removedAt).filter(a => !(a.bgc === 'Pending' && !a.training && a.contractSigning !== 'Complete' && !a.dcc));

  const [removeFor, setRemoveFor] = React.useState(null);
  const [removeComment, setRemoveComment] = React.useState('');

  const doRemove = () => {
    if (!removeFor) return;
    removeDriver(removeFor, removeComment.trim());
    setRemoveFor(null);
    setRemoveComment('');
  };

  const PhaseTable = ({ title, rows, cols }) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>{title}</Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 700, fontSize: 12 }}>{c}</th>
              ))}
              <th style={{ width: 1 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email}>
                {cols.includes('Date Applied') && <td style={{ padding: '10px 12px' }}>{r.dateApplied || '—'}</td>}
                {cols.includes('Full Name') && <td style={{ padding: '10px 12px' }}>{r.name || r.email}</td>}
                {cols.includes('Phone') && <td style={{ padding: '10px 12px' }}>{r.phone || '—'}</td>}
                {cols.includes('Pre-DCC') && (
                  <td style={{ padding: '10px 12px' }}>{r.preDCC}</td>
                )}
                {cols.includes('Account ID') && (
                  <td style={{ padding: '10px 12px' }}>{r.accountId || <span style={{opacity:.5}}>Enter Account ID</span>}</td>
                )}
                {cols.includes('DL Verification') && <td style={{ padding: '10px 12px' }}>{r.dlVerification}</td>}

                {cols.includes('BGC') && <td style={{ padding: '10px 12px' }}>{r.bgc}</td>}
                {cols.includes('Training') && (
                  <td style={{ padding: '10px 12px' }}>{r.training ? new Date(r.training).toLocaleDateString() : '—'}</td>
                )}
                {cols.includes('Contract Signing') && <td style={{ padding: '10px 12px' }}>{r.contractSigning}</td>}
                {cols.includes('DCC') && (
                  <td style={{ padding: '10px 12px' }}>
                    <Button size="small" variant="outlined" onClick={() => nav(`/admin/drivers/${encodeURIComponent(r.email)}/profile`)}>Open</Button>
                  </td>
                )}

                <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                  <RowActions
                    email={r.email}
                    onActivate={(email) => activateDriver(email)}
                    onRemove={(email) => setRemoveFor(email)}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length+1} style={{ padding: 16, color: '#6B7280' }}>No records.</td></tr>
            )}
          </tbody>
        </table>
      </Box>

      {removeFor && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography sx={{ mb: 1, fontWeight: 700 }}>Remove application</Typography>
          <TextField
            label="Comment (optional)"
            size="small"
            fullWidth
            value={removeComment}
            onChange={(e) => setRemoveComment(e.target.value)}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" color="error" onClick={doRemove}>Remove</Button>
            <Button variant="text" onClick={() => { setRemoveFor(null); setRemoveComment(''); }}>Cancel</Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Onboarding</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>Applications received today</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{today}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>Phase 1</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{phase1.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>Phase 2</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{phase2.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <PhaseTable
        title="Phase 1"
        rows={phase1}
        cols={['Date Applied','Full Name','Phone','Pre-DCC','Account ID','DL Verification']}
      />

      <PhaseTable
        title="Phase 2"
        rows={phase2}
        cols={['Date Applied','Full Name','Phone','BGC','Training','Contract Signing','DCC']}
      />
    </Box>
  );
}

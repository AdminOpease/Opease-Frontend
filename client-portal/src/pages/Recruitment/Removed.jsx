// src/pages/Recruitment/Removed.jsx
import * as React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAppStore } from '../../state/AppStore.jsx';

function stageBeforeRemoval(app) {
  if (app.dcc) return 'DCC';
  if (app.contractSigning === 'Complete') return 'Contract Signing';
  if (app.training) return 'Training';
  if (app.bgc && app.bgc !== 'Pending') return 'BGC';
  if (app.dlVerification && app.dlVerification !== 'Pending') return 'DL Verification';
  if (app.preDCC) return 'Pre-DCC';
  return 'Applied';
}

export default function Removed() {
  const { applications, restoreDriver } = useAppStore();
  const rows = applications.filter(a => a.removedAt);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Removed Applications</Typography>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
            <thead>
              <tr>
                {['Date Applied','Full Name','Phone','Stage at Removal','Comment',''].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'8px 12px', color:'#6B7280', fontWeight:700, fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.email}>
                  <td style={{ padding:'10px 12px' }}>{r.dateApplied || '—'}</td>
                  <td style={{ padding:'10px 12px' }}>{r.name || r.email}</td>
                  <td style={{ padding:'10px 12px' }}>{r.phone || '—'}</td>
                  <td style={{ padding:'10px 12px' }}>{stageBeforeRemoval(r)}</td>
                  <td style={{ padding:'10px 12px', maxWidth: 360 }}>{r.removedComment || '—'}</td>
                  <td style={{ padding:'10px 12px', textAlign:'right' }}>
                    <Button size="small" variant="outlined" onClick={() => restoreDriver(r.email)}>Add back</Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 16, color:'#6B7280' }}>No removed applications.</td></tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}

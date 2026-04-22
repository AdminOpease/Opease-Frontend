// src/pages/Admin/Stations.jsx
import * as React from 'react';
import {
  Box, Paper, Stack, Typography, TextField, Button, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { stations as stationsApi } from '../../services/api';
import { useAppStore } from '../../state/AppStore.jsx';

export default function Stations() {
  const { fetchStations } = useAppStore();
  const [stationList, setStationList] = React.useState([]);
  const [newCode, setNewCode] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editCode, setEditCode] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [showAdd, setShowAdd] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await stationsApi.list();
      setStationList(res.data || []);
    } catch (e) { console.error('Failed to load stations:', e); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditCode(s.code);
    setEditName(s.name);
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async () => {
    if (!editCode.trim() || !editName.trim()) return;
    try {
      await stationsApi.update(editingId, { code: editCode.trim(), name: editName.trim() });
      await load();
      if (fetchStations) fetchStations();
      cancelEdit();
    } catch (e) { console.error('Failed to update station:', e); }
  };

  const removeStation = async (id) => {
    try {
      await stationsApi.remove(id);
      await load();
      if (fetchStations) fetchStations();
    } catch (e) { console.error('Failed to delete station:', e); }
  };

  const handleAdd = async () => {
    const code = (newCode || '').trim();
    const name = (newName || '').trim();
    if (!code || !name) return;
    try {
      await stationsApi.create({ code, name });
      await load();
      if (fetchStations) fetchStations();
      setNewCode('');
      setNewName('');
      setShowAdd(false);
    } catch (e) { console.error('Failed to add station:', e); }
  };

  const pageSx = {}; // was mt:-9 — content now sits below nav like Operations pages
  const th = { fontWeight: 700 };
  const containerSx = { maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, sm: 0 } };

  return (
    <Box sx={pageSx}>
      <Box sx={containerSx}>
        {/* ── Page header bar (matches Operations pages) ─────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="h6">Stations</Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700, px: 2 }}
            onClick={() => setShowAdd(v => !v)}
          >
            Add Station
          </Button>
        </Box>

        <Collapse in={showAdd} unmountOnExit>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <TextField
                placeholder="Station code (e.g. DLU2)"
                size="small"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px' }, '& .MuiOutlinedInput-input': { py: 0.75 }, minWidth: 180 }}
              />
              <TextField
                placeholder="Station name (e.g. Dartford)"
                size="small"
                fullWidth
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px' }, '& .MuiOutlinedInput-input': { py: 0.75 }, minWidth: 200 }}
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={handleAdd} sx={{ fontWeight: 700 }}>Add</Button>
                <Button variant="text" onClick={() => { setShowAdd(false); setNewCode(''); setNewName(''); }}>Cancel</Button>
              </Stack>
            </Stack>
          </Paper>
        </Collapse>

        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table
            size="small"
            sx={{
              '& th, & td': { px: 1.5 },
              '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
              '& thead th:last-of-type,  & tbody td:last-of-type': { pr: 3 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...th, width: 64 }}>#</TableCell>
                <TableCell sx={{ ...th, width: 120 }}>Code</TableCell>
                <TableCell sx={th}>Name</TableCell>
                <TableCell align="right" sx={{ ...th, width: 160 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stationList.map((s, i) => (
                <TableRow key={s.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {editingId === s.id ? (
                      <TextField size="small" value={editCode} onChange={(e) => setEditCode(e.target.value)} sx={{ width: 100 }} />
                    ) : (
                      <Typography sx={{ fontWeight: 600 }}>{s.code}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === s.id ? (
                      <TextField size="small" fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : (
                      <Typography>{s.name}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === s.id ? (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton onClick={saveEdit} size="small"><CheckIcon /></IconButton>
                        <IconButton onClick={cancelEdit} size="small"><CloseIcon /></IconButton>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton onClick={() => startEdit(s)} size="small"><EditIcon /></IconButton>
                        <IconButton onClick={() => removeStation(s.id)} size="small" color="error"><DeleteIcon /></IconButton>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {stationList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No stations yet. Click "Add Station".</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}

// src/pages/Admin/Stations.jsx
import * as React from 'react';
import {
  Box, Paper, Stack, Typography, TextField, Button, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAppStore } from '../../state/AppStore.jsx';

export default function Stations() {
  const { depots, setDepots } = useAppStore();
  const [newName, setNewName] = React.useState('');
  const [editingIndex, setEditingIndex] = React.useState(-1);
  const [editingValue, setEditingValue] = React.useState('');

  const addDepot = () => {
    const name = (newName || '').trim();
    if (!name) return;
    if (depots.some(d => d.toLowerCase() === name.toLowerCase())) return;
    setDepots([...depots, name]);
    setNewName('');
  };

  const startEdit = (i) => {
    setEditingIndex(i);
    setEditingValue(depots[i]);
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditingValue('');
  };

  const saveEdit = () => {
    const name = editingValue.trim();
    if (!name) return;
    const next = depots.slice();
    next[editingIndex] = name;
    setDepots(next);
    cancelEdit();
  };

  const removeDepot = (i) => {
    const next = depots.filter((_, idx) => idx !== i);
    setDepots(next);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Stations</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        Manage the list of Stations/Locations shown on the application form. Changes are saved locally for now and will sync via the backend later.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="New station name"
            fullWidth
            size="small"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={addDepot} variant="contained" sx={{ borderRadius: 0, fontWeight: 700 }}>
            Add Station
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 64 }}>#</TableCell>
              <TableCell>Station Name</TableCell>
              <TableCell align="right" sx={{ width: 160 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {depots.map((name, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {editingIndex === i ? (
                    <TextField
                      size="small"
                      fullWidth
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                    />
                  ) : (
                    <Typography>{name}</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingIndex === i ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton onClick={saveEdit} size="small"><CheckIcon /></IconButton>
                      <IconButton onClick={cancelEdit} size="small"><CloseIcon /></IconButton>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton onClick={() => startEdit(i)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => removeDepot(i)} size="small"><DeleteIcon /></IconButton>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {depots.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="text.secondary">No stations yet. Add one above.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

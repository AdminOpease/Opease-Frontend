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
import { useAppStore } from '../../state/AppStore.jsx';

export default function Stations() {
  const { depots, setDepots } = useAppStore();
  const [newName, setNewName] = React.useState('');
  const [editingIndex, setEditingIndex] = React.useState(-1);
  const [editingValue, setEditingValue] = React.useState('');
  const [showAdd, setShowAdd] = React.useState(false);

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

  const handleAdd = () => {
    const name = (newName || '').trim();
    if (!name) return;
    if (depots.some(d => d.toLowerCase() === name.toLowerCase())) return;
    setDepots([...depots, name]);
    setNewName('');
    setShowAdd(false);
  };

  // ---- styles (align with Drivers page) ----
  const pageSx = { mt: -9 };
  const card = {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    px: 1.25,
  };
  const th = { fontWeight: 700 };

  // centered content width
  const containerSx = { maxWidth: 960, mx: 'auto', width: '100%', px: { xs: 2, sm: 0 } };

  return (
    <Box sx={pageSx}>
      <Box sx={containerSx}>
        {/* Top bar: right-aligned button only */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            sx={{ fontWeight: 700 }}
            onClick={() => setShowAdd(v => !v)}
          >
            Add Station
          </Button>
        </Box>

        {/* Sub-box for adding a station (appears when button is pressed) */}
        <Collapse in={showAdd} unmountOnExit>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems="center"
              sx={{ width: '100%' }}
            >
              <TextField
                placeholder="Station name"
                fullWidth
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '999px' },
                  '& .MuiOutlinedInput-input': { py: 0.75 },
                  minWidth: 260
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={handleAdd} sx={{ fontWeight: 700 }}>
                  Add
                </Button>
                <Button variant="text" onClick={() => { setShowAdd(false); setNewName(''); }}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Collapse>

        {/* Table styled like Drivers */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table
            size="small"
            sx={{
              '& th, & td': { px: 1.5 },
              '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
              '& thead th:last-of-type,  & tbody td:last-of-type':  { pr: 3 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...th, width: 64 }}>#</TableCell>
                <TableCell sx={th}>Station Name</TableCell>
                <TableCell align="right" sx={{ ...th, width: 160 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {depots.map((name, i) => (
                <TableRow key={i} hover>
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
                    <Typography color="text.secondary">No stations yet. Click “Add Station”.</Typography>
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

// src/pages/Operations/PlanAM.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, IconButton, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Snackbar, Alert,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useOutletContext } from 'react-router-dom';
import { SHIFT_CODES } from '../../data/rotaDemoData.js';
import { planAm as planAmApi, rota as rotaApi } from '../../services/api';
import ShiftChip from '../../components/operations/ShiftChip.jsx';
import * as XLSX from 'xlsx';

const ALL = 'All Depots';

const COLUMNS = [
  { key: 'driver', label: 'Driver', width: '22%', editable: false },
  { key: 'tid', label: 'Transporter ID', width: '14%', editable: false },
  { key: 'van', label: 'Van', width: '10%', editable: true },
  { key: 'route', label: 'Route #', width: '14%', editable: true },
  { key: 'bay', label: 'Loading Bay', width: '18%', editable: true },
  { key: 'atlas', label: 'ATLAS', width: '10%', editable: true },
];

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const menuPaperSx = {
  mt: 0.5,
  minWidth: 240,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
};

const thSx = {
  fontSize: 11,
  fontWeight: 700,
  color: 'text.secondary',
  py: 0.5,
  px: 1,
  borderBottom: '2px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
};

const tdSx = {
  fontSize: 12.5,
  py: 0.3,
  px: 1,
  borderBottom: '1px solid',
  borderColor: '#F0F0F0',
};

// Inline editable cell
function EditableCell({ value, onSave, sx }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (editing) {
    return (
      <TextField
        autoFocus
        size="small"
        variant="standard"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        InputProps={{ disableUnderline: true, sx: { fontSize: 12, py: 0, ...sx } }}
        sx={{ width: '100%' }}
      />
    );
  }

  return (
    <Box
      onClick={() => { setEditing(true); setDraft(value); }}
      sx={{
        cursor: 'pointer',
        minHeight: 20,
        borderRadius: 0.5,
        px: 0.3,
        '&:hover': { bgcolor: '#E3F2FD', outline: '1px solid #90CAF9' },
        ...sx,
      }}
    >
      {value || <span style={{ color: '#bbb' }}>—</span>}
    </Box>
  );
}

export default function PlanAM() {
  const { depot } = useOutletContext();

  const [dayOffset, setDayOffset] = React.useState(0);
  const currentDate = addDays(new Date(), dayOffset);

  // Fetch AM plan groups from API
  const [groups, setGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const dateStr = toISO(currentDate);
    if (depot === ALL) return;
    setLoading(true);
    planAmApi.list({ date: dateStr, depot })
      .then((res) => {
        const apiGroups = (res.data || []).map((g) => ({
          id: g.id,
          group: g.title,
          time: g.time,
          color: g.color,
          bg_color: g.bg_color,
          linked_shift_code: g.linked_shift_code,
          rows: (g.rows || []).map((r) => ({
            id: r.id,
            driver: `${r.first_name} ${r.last_name}`,
            tid: r.amazon_id || '',
            van: r.van || '',
            route: r.route || '',
            bay: r.bay || '',
            atlas: r.atlas || '',
          })),
        }));
        setGroups(apiGroups);
      })
      .catch((err) => console.error('Failed to fetch AM plan:', err))
      .finally(() => setLoading(false));
  }, [dayOffset, depot]);

  // Route group header options
  const defaultOptions = groups.map((g) => `${g.group} - ${g.time}`);
  const [routeOptions, setRouteOptions] = React.useState([]);
  React.useEffect(() => { setRouteOptions(groups.map((g) => `${g.group} - ${g.time}`)); }, [groups]);
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [menuIdx, setMenuIdx] = React.useState(null);
  const [headerOverrides, setHeaderOverrides] = React.useState({});
  const [hiddenSections, setHiddenSections] = React.useState(new Set());
  const [sectionLinks, setSectionLinks] = React.useState({});

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newOption, setNewOption] = React.useState('');

  // Cell edits: keyed by "groupIdx-rowIdx-colKey"
  const [cellEdits, setCellEdits] = React.useState({});

  // Upload feedback
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = React.useRef(null);

  // Use groups directly (rota linking simplified for now)
  const resolvedGroups = groups;

  // Get cell value with edits overlay
  const getCellValue = (gIdx, rIdx, key, original) => {
    const editKey = `${gIdx}-${rIdx}-${key}`;
    return editKey in cellEdits ? cellEdits[editKey] : (original || '');
  };

  const handleCellSave = (gIdx, rIdx, key, val) => {
    setCellEdits((prev) => ({ ...prev, [`${gIdx}-${rIdx}-${key}`]: val }));
    // Persist to API
    const row = resolvedGroups[gIdx]?.rows?.[rIdx];
    if (row?.id) {
      planAmApi.updateRow(row.id, { [key]: val }).catch((err) => console.error('Failed to save cell:', err));
    }
  };

  // Excel upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // Find the Transporter ID column (flexible header matching)
        const headers = Object.keys(rows[0] || {});
        const tidCol = headers.find((h) =>
          /transporter/i.test(h) || /amazon.*id/i.test(h) || /tid/i.test(h) || /driver.*id/i.test(h)
        );
        const routeCol = headers.find((h) => /route/i.test(h));
        const vanCol = headers.find((h) => /van/i.test(h));
        const bayCol = headers.find((h) => /bay|loading/i.test(h));
        const atlasCol = headers.find((h) => /atlas/i.test(h));

        if (!tidCol) {
          setSnackbar({ open: true, message: 'Could not find a Transporter ID column in the file', severity: 'error' });
          return;
        }

        // Build lookup: tid -> row data
        const lookup = {};
        rows.forEach((r) => {
          const tid = String(r[tidCol] || '').trim();
          if (tid) {
            lookup[tid] = {
              ...(routeCol && { route: String(r[routeCol] || '') }),
              ...(vanCol && { van: String(r[vanCol] || '') }),
              ...(bayCol && { bay: String(r[bayCol] || '') }),
              ...(atlasCol && { atlas: String(r[atlasCol] || '') }),
            };
          }
        });

        // Match against current table rows and apply edits
        let matchCount = 0;
        const newEdits = { ...cellEdits };
        resolvedGroups.forEach((g, gIdx) => {
          g.rows.forEach((row, rIdx) => {
            const match = lookup[row.tid];
            if (match) {
              matchCount++;
              Object.entries(match).forEach(([key, val]) => {
                if (val) newEdits[`${gIdx}-${rIdx}-${key}`] = val;
              });
            }
          });
        });

        setCellEdits(newEdits);
        setSnackbar({
          open: true,
          message: `Matched ${matchCount} driver${matchCount !== 1 ? 's' : ''} from ${rows.length} rows`,
          severity: matchCount > 0 ? 'success' : 'warning',
        });
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to read file: ' + err.message, severity: 'error' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleHeaderClick = (e, idx) => {
    setMenuAnchor(e.currentTarget);
    setMenuIdx(idx);
  };

  const handleSelectOption = (option) => {
    if (menuIdx !== null) {
      setHeaderOverrides((prev) => ({ ...prev, [menuIdx]: option }));
    }
    setMenuAnchor(null);
    setMenuIdx(null);
  };

  const handleAddNew = () => {
    setMenuAnchor(null);
    setAddDialogOpen(true);
    setNewOption('');
  };

  const handleDeleteOption = (option) => {
    setRouteOptions((prev) => prev.filter((o) => o !== option));
    setHiddenSections((prev) => {
      const next = new Set(prev);
      next.add(option);
      return next;
    });
    setHeaderOverrides((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (next[k] === option) delete next[k]; });
      return next;
    });
    setMenuAnchor(null);
    setMenuIdx(null);
  };

  const handleConfirmAdd = () => {
    const trimmed = newOption.trim();
    if (trimmed && !routeOptions.includes(trimmed)) {
      setRouteOptions((prev) => [...prev, trimmed]);
      if (menuIdx !== null) {
        setHeaderOverrides((prev) => ({ ...prev, [menuIdx]: trimmed }));
      }
    }
    setAddDialogOpen(false);
    setNewOption('');
    setMenuIdx(null);
  };

  const getGroupStyle = (groupTitle) => {
    const g = groups.find((g) => g.group === groupTitle);
    return g ? { color: g.color || '#424242', bg: g.bg_color || '#FAFAFA' } : { color: '#424242', bg: '#FAFAFA' };
  };

  return (
    <Box>
      {/* Upload button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
          }}
        >
          Upload Routes
        </Button>
      </Box>

      {/* Date header */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            px: 2,
            py: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton size="small" onClick={() => setDayOffset((d) => d - 1)} sx={{ color: 'white' }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: 'white',
              minWidth: 260,
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            {formatDate(currentDate)}
          </Typography>
          <IconButton size="small" onClick={() => setDayOffset((d) => d + 1)} sx={{ color: 'white' }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      {/* Route group tables */}
      {resolvedGroups
        .filter((g) => !hiddenSections.has(`${g.group} - ${g.time}`))
        .map((g, gIdx) => {
          const style = getGroupStyle(g.group);
          const displayText = headerOverrides[gIdx] || `${g.group} - ${g.time}`;

          return (
            <Paper key={g.group} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
              {/* Group header */}
              <Box
                onClick={(e) => handleHeaderClick(e, gIdx)}
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: style.bg,
                  borderBottom: '2px solid',
                  borderColor: style.color + '30',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': { opacity: 0.85 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: style.color }}>
                    {displayText}
                  </Typography>
                  {sectionLinks[gIdx] && (() => {
                    const sc = SHIFT_CODES[sectionLinks[gIdx]];
                    return (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 28,
                        height: 20,
                        padding: '0 4px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        lineHeight: 1,
                        color: sc?.color || '#333',
                        backgroundColor: sc?.bg || '#eee',
                        border: `1px solid ${(sc?.color || '#333') + '30'}`,
                      }}>
                        {sectionLinks[gIdx]}
                      </span>
                    );
                  })()}
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: style.color, opacity: 0.7 }}>
                  {g.rows.length} driver{g.rows.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Edge case messages */}
              {g._outOfRange && (
                <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>
                    Date outside rota range
                  </Typography>
                </Box>
              )}
              {!g._outOfRange && g._linked && g.rows.length === 0 && (
                <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>
                    No drivers with this shift code today
                  </Typography>
                </Box>
              )}

              {/* Data table */}
              {g.rows.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {COLUMNS.map((col) => (
                          <TableCell key={col.key} sx={{ ...thSx, width: col.width }}>
                            {col.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {g.rows.map((row, rIdx) => (
                        <TableRow
                          key={rIdx}
                          sx={{ '&:hover': { bgcolor: '#FAFAFA' }, '&:last-child td': { borderBottom: 0 } }}
                        >
                          {/* Driver (non-editable) */}
                          <TableCell sx={tdSx}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{row.driver}</Typography>
                          </TableCell>

                          {/* Transporter ID (non-editable) */}
                          <TableCell sx={tdSx}>
                            <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>
                              {row.tid || '—'}
                            </Typography>
                          </TableCell>

                          {/* Van (editable) */}
                          <TableCell sx={tdSx}>
                            <EditableCell
                              value={getCellValue(gIdx, rIdx, 'van', row.van)}
                              onSave={(v) => handleCellSave(gIdx, rIdx, 'van', v)}
                              sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#2E4C1E' }}
                            />
                          </TableCell>

                          {/* Route # (editable) */}
                          <TableCell sx={tdSx}>
                            <EditableCell
                              value={getCellValue(gIdx, rIdx, 'route', row.route)}
                              onSave={(v) => handleCellSave(gIdx, rIdx, 'route', v)}
                              sx={{ fontFamily: 'monospace' }}
                            />
                          </TableCell>

                          {/* Loading Bay (editable) */}
                          <TableCell sx={tdSx}>
                            <EditableCell
                              value={getCellValue(gIdx, rIdx, 'bay', row.bay)}
                              onSave={(v) => handleCellSave(gIdx, rIdx, 'bay', v)}
                              sx={{ color: '#666' }}
                            />
                          </TableCell>

                          {/* ATLAS (editable) */}
                          <TableCell sx={tdSx}>
                            <EditableCell
                              value={getCellValue(gIdx, rIdx, 'atlas', row.atlas)}
                              onSave={(v) => handleCellSave(gIdx, rIdx, 'atlas', v)}
                              sx={{ fontWeight: 700, color: '#E65100' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          );
        })}

      {resolvedGroups.length === 0 && (
        <Paper sx={{ borderRadius: 2, textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>No AM plan data for this depot</Typography>
        </Paper>
      )}

      {/* Route type dropdown menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuIdx(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ sx: menuPaperSx }}
        MenuListProps={{ dense: true, sx: { py: 0.5 } }}
      >
        {routeOptions.map((option) => {
          const isSelected = menuIdx !== null && (headerOverrides[menuIdx] || `${groups[menuIdx]?.group} - ${groups[menuIdx]?.time}`) === option;
          return (
            <MenuItem
              key={option}
              onClick={() => handleSelectOption(option)}
              sx={{
                fontSize: 13,
                py: 0.75,
                justifyContent: 'center',
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? '#D32F2F' : 'text.primary',
                position: 'relative',
                '& .delete-btn': { opacity: 0 },
                '&:hover .delete-btn': { opacity: 1 },
              }}
            >
              {option}
              <IconButton
                className="delete-btn"
                size="small"
                onClick={(e) => { e.stopPropagation(); handleDeleteOption(option); }}
                sx={{ position: 'absolute', right: 4, p: 0.3, color: 'text.disabled', '&:hover': { color: '#D32F2F' } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </MenuItem>
          );
        })}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleAddNew} sx={{ fontSize: 13, py: 0.75, justifyContent: 'center', color: 'primary.main', fontWeight: 600 }}>
          <AddIcon sx={{ fontSize: 16, mr: 0.5 }} /> Add New
        </MenuItem>

        {/* Link to Rota */}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disabled sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', py: 0.5, justifyContent: 'center', minHeight: 0 }}>
          <LinkIcon sx={{ fontSize: 14, mr: 0.5 }} /> LINK TO ROTA
        </MenuItem>

        {menuIdx !== null && sectionLinks[menuIdx] && (
          <MenuItem
            onClick={() => {
              setSectionLinks((prev) => { const next = { ...prev }; delete next[menuIdx]; return next; });
              setMenuAnchor(null);
              setMenuIdx(null);
            }}
            sx={{ fontSize: 13, py: 0.75, justifyContent: 'center', color: '#D32F2F', fontWeight: 600 }}
          >
            <LinkOffIcon sx={{ fontSize: 16, mr: 0.5 }} /> Unlink from Rota
          </MenuItem>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 1.5, py: 1, justifyContent: 'center' }}>
          {Object.keys(SHIFT_CODES).map((code) => {
            const isActive = menuIdx !== null && sectionLinks[menuIdx] === code;
            return (
              <Box
                key={code}
                onClick={() => {
                  if (menuIdx !== null) setSectionLinks((prev) => ({ ...prev, [menuIdx]: code }));
                  setMenuAnchor(null);
                  setMenuIdx(null);
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  outline: isActive ? '2px solid #D32F2F' : 'none',
                  outlineOffset: 1,
                  '&:hover': { opacity: 0.75 },
                }}
              >
                <ShiftChip code={code} />
              </Box>
            );
          })}
        </Box>
      </Menu>

      {/* Add new route type dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Add Route Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="e.g. Express Routes - 07:30"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleConfirmAdd} variant="contained" size="small" disabled={!newOption.trim()}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Upload feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

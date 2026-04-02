// src/pages/Operations/PlanPM.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, IconButton, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useOutletContext } from 'react-router-dom';
import { SHIFT_CODES } from '../../data/rotaDemoData.js';
import { planPm as planPmApi } from '../../services/api';
import ShiftChip from '../../components/operations/ShiftChip.jsx';

const ALL = 'All Depots';

const DEFAULT_ROUTE_OPTIONS = [
  'Same Day Routes - 06:10AM',
  'SWA - 09:50AM',
  'Full Routes - 10:10AM',
  'Electric Vehicle - 11:00AM',
  'Ride Along - 11:00AM',
  'Cycle 2 Route - 12:40PM',
  'Nursery Routes - 07:00AM',
  'Priority Routes - 08:30AM',
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

export default function PlanPM() {
  const { depot } = useOutletContext();

  // Scrollable date
  const [dayOffset, setDayOffset] = React.useState(0);
  const currentDate = addDays(new Date(), dayOffset);

  // Fetch PM plan sections from API
  const [sections, setSections] = React.useState([]);
  const generatedRef = React.useRef(new Set());

  const mapSections = (data) => (data || []).map((s) => ({
    id: s.id,
    section: s.title,
    time: s.time,
    linked_shift_code: s.linked_shift_code || '',
    drivers: (s.drivers || []).map((d) => ({
      name: `${d.first_name} ${d.last_name}`,
      tid: d.transporter_id || d.amazon_id || '',
    })),
  }));

  const fetchPlan = React.useCallback(async () => {
    const dateStr = toISO(currentDate);
    if (depot === ALL) return;
    try {
      const res = await planPmApi.list({ date: dateStr, depot });
      let apiSections = mapSections(res.data);

      const key = `${dateStr}-${depot}`;
      if (apiSections.length === 0 && !generatedRef.current.has(key)) {
        generatedRef.current.add(key);
        // Create default sections with linked_shift_code, then generate from rota
        const defaults = [
          { title: 'Same Day', time: '14:00', linked_shift_code: 'SD' },
          { title: 'SWA', time: '14:30', linked_shift_code: 'SWA' },
          { title: 'Full Routes', time: '15:00', linked_shift_code: 'W' },
        ];
        for (let i = 0; i < defaults.length; i++) {
          await planPmApi.createSection({
            plan_date: dateStr,
            depot,
            ...defaults[i],
            sort_order: Date.now() + i,
          });
        }
        await planPmApi.generate({ date: dateStr, depot });
        const res2 = await planPmApi.list({ date: dateStr, depot });
        apiSections = mapSections(res2.data);
      }
      setSections(apiSections);
    } catch (err) {
      console.error('Failed to fetch PM plan:', err);
    }
  }, [dayOffset, depot]);

  React.useEffect(() => { fetchPlan(); }, [fetchPlan]);

  // Route type options (pre-set + user-added)
  const [routeOptions, setRouteOptions] = React.useState(DEFAULT_ROUTE_OPTIONS);

  // Dropdown state
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [menuIdx, setMenuIdx] = React.useState(null);
  const [headerOverrides, setHeaderOverrides] = React.useState({});

  // Hidden sections
  const [hiddenSections, setHiddenSections] = React.useState(new Set());

  // Add new section dialog
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newOption, setNewOption] = React.useState('');

  // Use sections directly
  const resolvedSections = sections;

  // Open dropdown for a section header
  const handleHeaderClick = (e, idx) => {
    setMenuAnchor(e.currentTarget);
    setMenuIdx(idx);
  };

  // Select an option from dropdown
  const handleSelectOption = (option) => {
    if (menuIdx !== null) {
      setHeaderOverrides((prev) => ({ ...prev, [menuIdx]: option }));
    }
    setMenuAnchor(null);
    setMenuIdx(null);
  };

  // Add new route type
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

  const handleConfirmAdd = async () => {
    const trimmed = newOption.trim();
    if (!trimmed) { setAddDialogOpen(false); return; }

    const parts = trimmed.split(' - ');
    const title = parts[0] || trimmed;
    const time = parts[1] || '';
    const dateStr = toISO(currentDate);

    try {
      await planPmApi.createSection({
        plan_date: dateStr,
        depot,
        title,
        time,
        sort_order: Date.now(),
      });
      await fetchPlan();
    } catch (err) {
      console.error('Failed to create section:', err);
      alert('Failed to create section: ' + (err.message || err));
    }

    if (!routeOptions.includes(trimmed)) {
      setRouteOptions((prev) => [...prev, trimmed]);
    }
    if (menuIdx !== null) {
      setHeaderOverrides((prev) => ({ ...prev, [menuIdx]: trimmed }));
    }
    setAddDialogOpen(false);
    setNewOption('');
    setMenuIdx(null);
  };

  // Link/unlink section to rota shift code
  const handleLinkRota = async (code) => {
    if (menuIdx === null) return;
    const section = resolvedSections[menuIdx];
    if (!section?.id) return;

    try {
      await planPmApi.updateSection(section.id, { linked_shift_code: code });
      // Re-generate to pull drivers for the new link
      const dateStr = toISO(currentDate);
      await planPmApi.generate({ date: dateStr, depot });
      await fetchPlan();
    } catch (err) {
      console.error('Failed to link rota:', err);
    }
    setMenuAnchor(null);
    setMenuIdx(null);
  };

  const handleUnlinkRota = async () => {
    if (menuIdx === null) return;
    const section = resolvedSections[menuIdx];
    if (!section?.id) return;

    try {
      await planPmApi.updateSection(section.id, { linked_shift_code: '' });
      await fetchPlan();
    } catch (err) {
      console.error('Failed to unlink rota:', err);
    }
    setMenuAnchor(null);
    setMenuIdx(null);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', maxWidth: 520, width: '100%' }}>
      {/* Date header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          px: 2,
          py: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
      </Box>

      {/* Add Group button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5, mb: 0.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => { setAddDialogOpen(true); setNewOption(''); }}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999, px: 3 }}
        >
          Add Group
        </Button>
      </Box>

      {/* Sections with drivers */}
      <Box sx={{ px: 3, py: 2, textAlign: 'center' }}>
        {resolvedSections.filter((s) => !hiddenSections.has(`${s.section} - ${s.time}`)).map((s, idx) => {
          const displayText = headerOverrides[idx] || `${s.section}${s.time ? ' - ' + s.time : ''}`;

          return (
            <Box key={s.id} sx={{ mb: idx < resolvedSections.length - 1 ? 2.5 : 0 }}>
              {/* Section header */}
              <Typography
                onClick={(e) => handleHeaderClick(e, idx)}
                sx={{
                  fontWeight: 700,
                  fontSize: 15.5,
                  color: '#D32F2F',
                  mb: 0.5,
                  borderBottom: '1px solid #EEEEEE',
                  pb: 0.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#FFF5F5', borderRadius: 1 },
                }}
              >
                {displayText}
                {s.linked_shift_code && (() => {
                  const sc = SHIFT_CODES[s.linked_shift_code];
                  return (
                    <span style={{
                      marginLeft: 6,
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
                      verticalAlign: 'middle',
                      color: sc?.color || '#333',
                      backgroundColor: sc?.bg || '#eee',
                      border: `1px solid ${(sc?.color || '#333') + '30'}`,
                    }}>
                      {s.linked_shift_code}
                    </span>
                  );
                })()}
                <Typography
                  component="span"
                  sx={{ ml: 1.5, fontSize: 13.5, color: 'text.secondary', fontWeight: 600 }}
                >
                  ({s.drivers.length})
                </Typography>
              </Typography>

              {s.linked_shift_code && s.drivers.length === 0 && (
                <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic', py: 1 }}>
                  No drivers with this shift code today
                </Typography>
              )}

              {/* Driver names */}
              {s.drivers.map((driver) => (
                <Typography
                  key={driver.tid || driver.name}
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.3,
                    py: 0.15,
                    color: 'text.primary',
                    '&:hover': { bgcolor: '#F5F5F5', borderRadius: 1 },
                  }}
                >
                  {driver.name}
                </Typography>
              ))}
            </Box>
          );
        })}

        {resolvedSections.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>No groups yet. Click "Add Group" to get started.</Typography>
          </Box>
        )}
      </Box>

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
          const isSelected = menuIdx !== null && (headerOverrides[menuIdx] || `${sections[menuIdx]?.section} - ${sections[menuIdx]?.time}`) === option;
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

        {/* Link to Rota section */}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disabled sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', py: 0.5, justifyContent: 'center', minHeight: 0 }}>
          <LinkIcon sx={{ fontSize: 14, mr: 0.5 }} /> LINK TO ROTA
        </MenuItem>

        {menuIdx !== null && resolvedSections[menuIdx]?.linked_shift_code && (
          <MenuItem
            onClick={handleUnlinkRota}
            sx={{ fontSize: 13, py: 0.75, justifyContent: 'center', color: '#D32F2F', fontWeight: 600 }}
          >
            <LinkOffIcon sx={{ fontSize: 16, mr: 0.5 }} /> Unlink from Rota
          </MenuItem>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 1.5, py: 1, justifyContent: 'center' }}>
          {Object.keys(SHIFT_CODES).map((code) => {
            const isActive = menuIdx !== null && resolvedSections[menuIdx]?.linked_shift_code === code;
            return (
              <Box
                key={code}
                onClick={() => handleLinkRota(code)}
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
    </Paper>

    {/* Add new route type dialog */}
    <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Add Route Type</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="e.g. Express Routes - 07:30AM"
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
    </Box>
  );
}

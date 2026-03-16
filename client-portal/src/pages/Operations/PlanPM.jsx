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
import { PM_PLAN_DATA } from '../../data/planDemoData.js';
import { ROTA_WEEKS, ROTA_DRIVERS, ROTA_SCHEDULE, SHIFT_CODES } from '../../data/rotaDemoData.js';
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

function findRotaPosition(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const iso = `${y}-${m}-${d}`;
  for (const week of ROTA_WEEKS) {
    const dayIndex = week.days.indexOf(iso);
    if (dayIndex !== -1) return { weekNumber: week.weekNumber, dayIndex };
  }
  return null;
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

  // Route type options (pre-set + user-added)
  const [routeOptions, setRouteOptions] = React.useState(DEFAULT_ROUTE_OPTIONS);

  // Dropdown state
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [menuIdx, setMenuIdx] = React.useState(null);
  const [headerOverrides, setHeaderOverrides] = React.useState({});

  // Hidden sections (removed from page via dropdown delete)
  const [hiddenSections, setHiddenSections] = React.useState(new Set());

  // Rota link: maps section index -> shift code string
  const [sectionLinks, setSectionLinks] = React.useState({});

  // Add new option dialog
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newOption, setNewOption] = React.useState('');

  // Merge all depots or show selected depot
  const sections = React.useMemo(() => {
    if (depot === ALL) {
      const merged = {};
      Object.values(PM_PLAN_DATA).forEach((depotSections) => {
        depotSections.forEach((s) => {
          const key = s.section;
          if (!merged[key]) {
            merged[key] = { section: s.section, time: s.time, drivers: [] };
          }
          s.drivers.forEach((d) => {
            if (!merged[key].drivers.includes(d)) {
              merged[key].drivers.push(d);
            }
          });
        });
      });
      Object.values(merged).forEach((s) => s.drivers.sort());
      const order = ['Same Day Routes', 'SWA', 'Full Routes', 'Electric Vehicle', 'Ride Along', 'Cycle 2 Route'];
      return order.map((title) => merged[title]).filter(Boolean);
    }
    const depotData = PM_PLAN_DATA[depot];
    if (!depotData) return [];
    return depotData.map((s) => ({ ...s, drivers: [...s.drivers].sort() }));
  }, [depot]);

  // Map current date to rota week/day
  const rotaPosition = React.useMemo(() => findRotaPosition(currentDate), [currentDate]);

  // Resolve drivers from rota for linked sections
  const resolvedSections = React.useMemo(() => {
    return sections.map((s, idx) => {
      const linkedCode = sectionLinks[idx];
      if (!linkedCode) return s;
      if (!rotaPosition) return { ...s, drivers: [], _outOfRange: true, _linked: true };
      const { weekNumber, dayIndex } = rotaPosition;
      const matchingDrivers = ROTA_DRIVERS
        .filter((driver) => {
          if (depot !== ALL && driver.depot !== depot) return false;
          if (driver.left === 1) return false;
          const key = `${driver.id}-${weekNumber}`;
          const shifts = ROTA_SCHEDULE[key];
          if (!shifts) return false;
          return shifts[dayIndex] === linkedCode;
        })
        .map((driver) => driver.name)
        .sort();
      return { ...s, drivers: matchingDrivers, _linked: true };
    });
  }, [sections, sectionLinks, rotaPosition, depot]);

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
    // Hide matching section from the page
    setHiddenSections((prev) => {
      const next = new Set(prev);
      next.add(option);
      return next;
    });
    // Clear any overrides that used the deleted option
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

      {/* Sections with drivers */}
      <Box sx={{ px: 3, py: 2, textAlign: 'center' }}>
        {resolvedSections.filter((s) => !hiddenSections.has(`${s.section} - ${s.time}`)).map((s, idx) => {
          const displayText = headerOverrides[idx] || `${s.section} - ${s.time}`;

          return (
            <Box key={s.section} sx={{ mb: idx < resolvedSections.length - 1 ? 2.5 : 0 }}>
              {/* Section header — click to open dropdown */}
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
                {sectionLinks[idx] && (() => {
                  const sc = SHIFT_CODES[sectionLinks[idx]];
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
                      {sectionLinks[idx]}
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

              {/* Edge case messages */}
              {s._outOfRange && (
                <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic', py: 1 }}>
                  Date outside rota range
                </Typography>
              )}
              {!s._outOfRange && s._linked && s.drivers.length === 0 && (
                <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic', py: 1 }}>
                  No drivers with this shift code today
                </Typography>
              )}

              {/* Driver names */}
              {s.drivers.map((driver) => (
                <Typography
                  key={driver}
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.3,
                    py: 0.15,
                    color: 'text.primary',
                    '&:hover': { bgcolor: '#F5F5F5', borderRadius: 1 },
                  }}
                >
                  {driver}
                </Typography>
              ))}
            </Box>
          );
        })}

        {resolvedSections.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>No plan data for this depot</Typography>
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

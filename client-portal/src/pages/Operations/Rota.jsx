// src/pages/Operations/Rota.jsx
import * as React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Popover,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StatusChip from '../../components/common/StatusChip';
import ShiftChip from '../../components/operations/ShiftChip';
import {
  ROTA_WEEKS,
  ROTA_DRIVERS,
  ROTA_SCHEDULE,
  SHIFT_CODES,
  countWorkDays,
} from '../../data/rotaDemoData';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUSES = ['All', 'Full Time', 'Part Time', 'Lead Driver', 'OSM'];

// ── Shared cell styling ─────────────────────────────────────────────
const cellSx = {
  fontSize: 11,
  px: 1,
  py: 0.5,
  borderRight: '1px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
};

const headCellSx = {
  ...cellSx,
  fontWeight: 700,
  bgcolor: '#F5F5F5',
  borderBottom: '2px solid',
  borderBottomColor: 'divider',
};

const stickyCellSx = (left, zExtra = 0) => ({
  position: 'sticky',
  left,
  zIndex: 2 + zExtra,
  bgcolor: 'inherit',
});

const stickyHeadSx = (left) => ({
  position: 'sticky',
  left,
  zIndex: 4,
});

function formatShortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatWeekRange(week) {
  const s = new Date(week.startDate + 'T00:00:00');
  const e = new Date(week.endDate + 'T00:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}`;
}

const SHIFT_CODE_KEYS = Object.keys(SHIFT_CODES);

export default function Rota() {
  const [weekIdx, setWeekIdx] = React.useState(0);
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [schedule, setSchedule] = React.useState(() => ({ ...ROTA_SCHEDULE }));

  // Edit popover state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [editTarget, setEditTarget] = React.useState(null); // { driverId, weekNumber, dayIndex }

  const week = ROTA_WEEKS[weekIdx];

  const filteredDrivers =
    statusFilter === 'All'
      ? ROTA_DRIVERS
      : ROTA_DRIVERS.filter((d) => d.status === statusFilter);

  const handleCellClick = (e, driverId, weekNumber, dayIndex) => {
    setAnchorEl(e.currentTarget);
    setEditTarget({ driverId, weekNumber, dayIndex });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setEditTarget(null);
  };

  const handlePickShift = (code) => {
    if (!editTarget) return;
    const { driverId, weekNumber, dayIndex } = editTarget;
    const key = `${driverId}-${weekNumber}`;
    setSchedule((prev) => {
      const shifts = [...(prev[key] || Array(7).fill(''))];
      shifts[dayIndex] = code;
      return { ...prev, [key]: shifts };
    });
    handleClose();
  };

  return (
    <Box>
      {/* ── Header bar ─────────────────────────────────────────── */}
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
        <Typography variant="h6">Rota</Typography>

        {/* Week navigator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            disabled={weekIdx === 0}
            onClick={() => setWeekIdx((i) => i - 1)}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              minWidth: 180,
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            Week {week.weekNumber} ({formatWeekRange(week)})
          </Typography>

          <IconButton
            size="small"
            disabled={weekIdx === ROTA_WEEKS.length - 1}
            onClick={() => setWeekIdx((i) => i + 1)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 130, fontSize: 12, height: 32, borderRadius: 2 }}
        >
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Schedule table ─────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                <TableCell sx={{ ...headCellSx, width: 36, ...stickyHeadSx(0) }}>#</TableCell>
                <TableCell sx={{ ...headCellSx, minWidth: 130, ...stickyHeadSx(36) }}>Name</TableCell>
                <TableCell sx={{ ...headCellSx, minWidth: 90, ...stickyHeadSx(166) }}>Status</TableCell>
                {week.days.map((day, i) => (
                  <TableCell key={day} align="center" sx={{ ...headCellSx, minWidth: 60 }}>
                    {DAY_LABELS[i]}
                    <br />
                    <span style={{ fontWeight: 400, fontSize: 10 }}>{formatShortDate(day)}</span>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ ...headCellSx, minWidth: 44 }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredDrivers.map((driver, idx) => {
                const key = `${driver.id}-${week.weekNumber}`;
                const shifts = schedule[key] || Array(7).fill('');
                const total = countWorkDays(shifts);

                return (
                  <TableRow
                    key={driver.id}
                    hover
                    sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFAFA' } }}
                  >
                    <TableCell
                      sx={{
                        ...cellSx,
                        fontWeight: 600,
                        textAlign: 'center',
                        ...stickyCellSx(0, 1),
                      }}
                    >
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 600, ...stickyCellSx(36) }}>
                      {driver.name}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, ...stickyCellSx(166) }}>
                      <StatusChip status={driver.status} />
                    </TableCell>

                    {shifts.map((code, d) => (
                      <TableCell
                        key={d}
                        align="center"
                        sx={{ ...cellSx, cursor: 'pointer', '&:hover': { bgcolor: '#F0F0F0' } }}
                        onClick={(e) => handleCellClick(e, driver.id, week.weekNumber, d)}
                      >
                        {code ? <ShiftChip code={code} /> : (
                          <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                        )}
                      </TableCell>
                    ))}

                    <TableCell
                      align="center"
                      sx={{ ...cellSx, fontWeight: 700, fontSize: 12 }}
                    >
                      {total}
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: 13 }}>
                    No drivers match the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, mr: 0.5 }}>Legend:</Typography>
        {Object.entries(SHIFT_CODES).map(([code, style]) => (
          <Box
            key={code}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: 10,
              color: 'text.secondary',
            }}
          >
            <ShiftChip code={code} />
            <span>{style.label}</span>
          </Box>
        ))}
      </Box>

      {/* ── Shift picker popover ───────────────────────────────── */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: { p: 1.5, borderRadius: 2, maxWidth: 280 },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {SHIFT_CODE_KEYS.map((code) => (
            <ShiftChip
              key={code}
              code={code}
              onClick={() => handlePickShift(code)}
            />
          ))}
          {/* Clear option */}
          <Box
            onClick={() => handlePickShift('')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 32,
              height: 22,
              px: 0.5,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 600,
              color: '#999',
              bgcolor: '#F5F5F5',
              border: '1px solid #DDD',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}

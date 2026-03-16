// src/pages/Operations/Rota.jsx
import * as React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  ClickAwayListener,
  Menu,
  MenuItem,
  Popover,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { useAppStore } from '../../state/AppStore.jsx';
import ShiftChip from '../../components/operations/ShiftChip';
import {
  ROTA_WEEKS,
  ROTA_DRIVERS,
  ROTA_SCHEDULE,
  SHIFT_CODES,
  countWorkDays,
} from '../../data/rotaDemoData';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

// ── Depot pill button (matches Drivers / ExpiringDocs) ───────────
const ALL = 'All Depots';

const pillBtnSx = {
  borderRadius: 9999,
  px: 2,
  minHeight: 34,
  border: '1px solid',
  borderColor: 'rgba(46,76,30,0.35)',
  color: 'primary.main',
  '&:hover': { backgroundColor: 'rgba(46,76,30,0.06)' },
};

const menuPaperSx = {
  mt: 0.5,
  minWidth: 200,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
};
const menuListSx = { py: 0 };
const navLikeItemSx = {
  justifyContent: 'center',
  textAlign: 'center',
  px: 2,
  py: 0.9,
  fontSize: 14,
  lineHeight: 1.25,
  '&:hover': { backgroundColor: 'action.hover' },
};

const filterInputSx = {
  width: '100%',
  height: 20,
  border: '1px solid #D0D0D0',
  borderRadius: 3,
  textAlign: 'center',
  fontSize: 10,
  outline: 'none',
  padding: '0 4px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export default function Rota() {
  const { depots } = useAppStore();
  const depotOptions = [ALL, ...depots];
  const [depot, setDepot] = React.useState('DLU2');
  const [depotEl, setDepotEl] = React.useState(null);

  const [weekIdx, setWeekIdx] = React.useState(0);
  const [schedule, setSchedule] = React.useState(() => ({ ...ROTA_SCHEDULE }));

  // Column filters
  const [nameFilter, setNameFilter] = React.useState('');
  const [idFilter, setIdFilter] = React.useState('');
  const [dayFilters, setDayFilters] = React.useState(Array(7).fill(''));

  // DA Capacity popover
  const [capacityEl, setCapacityEl] = React.useState(null);

  // Inline edit state
  const [editTarget, setEditTarget] = React.useState(null);
  const [editValue, setEditValue] = React.useState('');
  const editRef = React.useRef(null);

  const week = ROTA_WEEKS[weekIdx];

  const filteredDrivers = ROTA_DRIVERS.filter((driver) => {
    // Depot filter
    if (depot !== ALL && driver.depot !== depot) return false;
    // Name filter
    if (nameFilter && !driver.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    // Transporter ID filter
    if (idFilter && !driver.amazonId.toLowerCase().includes(idFilter.toLowerCase())) return false;
    // Day column filters — show driver only if their shift matches the filter for each filtered day
    const key = `${driver.id}-${week.weekNumber}`;
    const shifts = schedule[key] || Array(7).fill('');
    for (let d = 0; d < 7; d++) {
      if (dayFilters[d] && shifts[d].toUpperCase() !== dayFilters[d].toUpperCase()) return false;
    }
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // ── DA Capacity: drivers filtered by depot only (ignore column filters) ──
  const depotDrivers = ROTA_DRIVERS.filter((d) => depot === ALL || d.depot === depot);

  const capacity = React.useMemo(() => {
    const TRACKED = new Set(['SD', 'SWA', 'NL1', 'NL2', 'NL3', 'NL4', 'RA', 'SB']);
    const WORK_SET = new Set(['W', 'Office', 'OfficeLD', 'SD', 'Fleet', 'SB', 'DR', 'C', 'C2', 'NL3', '1P', 'SWA', 'DHW', 'MT']);
    const days = Array.from({ length: 7 }, () => ({ working: 0, rest: 0, sd: 0, swa: 0, nl1: 0, nl2: 0, nl3: 0, nl4: 0, ra: 0, sb: 0 }));

    depotDrivers.forEach((driver) => {
      const key = `${driver.id}-${week.weekNumber}`;
      const shifts = schedule[key] || Array(7).fill('');
      shifts.forEach((code, d) => {
        if (code === 'SD') days[d].sd += 1;
        else if (code === 'SWA') days[d].swa += 1;
        else if (code === 'NL1') days[d].nl1 += 1;
        else if (code === 'NL2') days[d].nl2 += 1;
        else if (code === 'NL3') days[d].nl3 += 1;
        else if (code === 'NL4') days[d].nl4 += 1;
        else if (code === 'RA') days[d].ra += 1;
        else if (code === 'SB') days[d].sb += 1;
        else if (code === 'R' || code === '') days[d].rest += 1;
        // Everything else goes into "working" (W, Office, Fleet, MT, etc.)
        if (WORK_SET.has(code) && !TRACKED.has(code)) days[d].working += 1;
      });
    });
    return days;
  }, [depotDrivers, week, schedule]);

  const handleCellClick = (driverId, weekNumber, dayIndex, currentCode) => {
    setEditTarget({ driverId, weekNumber, dayIndex });
    setEditValue(currentCode || '');
    // Focus the input after render
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const handleEditCommit = () => {
    if (!editTarget) return;
    const { driverId, weekNumber, dayIndex } = editTarget;
    const key = `${driverId}-${weekNumber}`;
    const trimmed = editValue.trim();
    // Accept valid shift codes or empty (clear)
    const code = SHIFT_CODES[trimmed] ? trimmed : (trimmed === '' ? '' : trimmed.toUpperCase());
    setSchedule((prev) => {
      const shifts = [...(prev[key] || Array(7).fill(''))];
      shifts[dayIndex] = SHIFT_CODES[code] ? code : '';
      return { ...prev, [key]: shifts };
    });
    setEditTarget(null);
    setEditValue('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditCommit();
    } else if (e.key === 'Escape') {
      setEditTarget(null);
      setEditValue('');
    }
  };

  const handleExportExcel = () => {
    const rows = filteredDrivers.map((driver, idx) => {
      const key = `${driver.id}-${week.weekNumber}`;
      const shifts = schedule[key] || Array(7).fill('');
      const row = {
        '#': idx + 1,
        Name: driver.name,
        'Transporter ID': driver.amazonId,
      };
      week.days.forEach((day, i) => {
        row[`${DAY_LABELS[i]} ${formatShortDate(day)}`] = shifts[i] || '';
      });
      row.Total = countWorkDays(shifts);
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const sheetName = `Week ${week.weekNumber}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const depotLabel = depot === ALL ? 'All' : depot;
    XLSX.writeFile(wb, `Rota_Week${week.weekNumber}_${depotLabel}.xlsx`);
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
        {/* DA Capacity button */}
        <Typography
          variant="h6"
          onClick={(e) => setCapacityEl(e.currentTarget)}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            '&:hover': { bgcolor: 'rgba(46,76,30,0.06)' },
          }}
        >
          Rota — DA Capacity ▾
        </Typography>

        <Popover
          open={Boolean(capacityEl)}
          anchorEl={capacityEl}
          onClose={() => setCapacityEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              mt: 1,
              p: 2.5,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 620,
            },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
            DA Capacity — Week {week.weekNumber}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>
            {depot === ALL ? 'All Depots' : depot} · {depotDrivers.length} driver{depotDrivers.length !== 1 ? 's' : ''}
          </Typography>

          <Table size="small" sx={{ '& th, & td': { px: 1, py: 0.6, fontSize: 12 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#2E7D32' }}>Working</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#00695C' }}>SD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#AD1457' }}>SWA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#0D47A1' }}>NL1</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#1565C0' }}>NL2</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#00838F' }}>NL3</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#00695C' }}>NL4</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#6A1B9A' }}>RA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#FF6F00' }}>SB</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#616161' }}>Rest</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {week.days.map((day, i) => (
                <TableRow key={day} sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFAFA' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {DAY_LABELS[i]} {formatShortDate(day)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                    {capacity[i].working}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#00695C' }}>
                    {capacity[i].sd}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#AD1457' }}>
                    {capacity[i].swa}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#0D47A1' }}>
                    {capacity[i].nl1}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#1565C0' }}>
                    {capacity[i].nl2}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#00838F' }}>
                    {capacity[i].nl3}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#00695C' }}>
                    {capacity[i].nl4}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#6A1B9A' }}>
                    {capacity[i].ra}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#FF6F00' }}>
                    {capacity[i].sb}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#616161' }}>
                    {capacity[i].rest}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {capacity[i].working + capacity[i].sd + capacity[i].swa + capacity[i].nl1 + capacity[i].nl2 + capacity[i].nl3 + capacity[i].nl4}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Popover>

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

        {/* Station selector + Download */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleExportExcel} sx={pillBtnSx} title="Download as Excel">
            <FileDownloadIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={(e) => setDepotEl(e.currentTarget)} sx={pillBtnSx}>
            <Typography component="span" sx={{ mr: 1, fontWeight: 700, fontSize: 14 }}>
              {depot}
            </Typography>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={depotEl}
            open={Boolean(depotEl)}
            onClose={() => setDepotEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            PaperProps={{ sx: menuPaperSx }}
            MenuListProps={{ dense: true, sx: menuListSx }}
          >
            {depotOptions.map((d) => (
              <MenuItem key={d} onClick={() => { setDepot(d); setDepotEl(null); }} sx={navLikeItemSx}>
                {d}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* ── Schedule table ─────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                <TableCell sx={{ ...headCellSx, width: 36, ...stickyHeadSx(0) }}>#</TableCell>
                <TableCell sx={{ ...headCellSx, minWidth: 130, ...stickyHeadSx(36) }}>Name</TableCell>
                <TableCell sx={{ ...headCellSx, minWidth: 90, ...stickyHeadSx(166) }}>Transporter ID</TableCell>
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

              {/* ── Filter row ──────────────────────────────────── */}
              <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(0), bgcolor: '#FAFAFA' }} />
                <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(36), bgcolor: '#FAFAFA' }}>
                  <input
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Filter..."
                    style={filterInputSx}
                  />
                </TableCell>
                <TableCell sx={{ ...cellSx, p: 0.5, ...stickyHeadSx(166), bgcolor: '#FAFAFA' }}>
                  <input
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                    placeholder="Filter..."
                    style={filterInputSx}
                  />
                </TableCell>
                {week.days.map((day, i) => (
                  <TableCell key={day} align="center" sx={{ ...cellSx, p: 0.5 }}>
                    <input
                      value={dayFilters[i]}
                      onChange={(e) => {
                        const next = [...dayFilters];
                        next[i] = e.target.value.toUpperCase();
                        setDayFilters(next);
                      }}
                      placeholder="—"
                      style={{ ...filterInputSx, width: 36 }}
                    />
                  </TableCell>
                ))}
                <TableCell sx={{ ...cellSx, p: 0.5 }} />
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
                    <TableCell sx={{ ...cellSx, fontSize: 10, color: 'text.secondary', ...stickyCellSx(166) }}>
                      {driver.amazonId}
                    </TableCell>

                    {shifts.map((code, d) => {
                      const isEditing =
                        editTarget?.driverId === driver.id &&
                        editTarget?.weekNumber === week.weekNumber &&
                        editTarget?.dayIndex === d;

                      return (
                        <TableCell
                          key={d}
                          align="center"
                          sx={{ ...cellSx, cursor: 'pointer', '&:hover': { bgcolor: '#F0F0F0' }, p: 0.25 }}
                          onClick={() => !isEditing && handleCellClick(driver.id, week.weekNumber, d, code)}
                        >
                          {isEditing ? (
                            <ClickAwayListener onClickAway={handleEditCommit}>
                              <input
                                ref={editRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                onKeyDown={handleEditKeyDown}
                                style={{
                                  width: 40,
                                  height: 22,
                                  border: '1.5px solid #2E4C1E',
                                  borderRadius: 4,
                                  textAlign: 'center',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  outline: 'none',
                                  padding: 0,
                                  fontFamily: 'inherit',
                                }}
                              />
                            </ClickAwayListener>
                          ) : code ? (
                            <ShiftChip code={code} />
                          ) : (
                            <Box sx={{ width: 32, height: 22, display: 'inline-block' }} />
                          )}
                        </TableCell>
                      );
                    })}

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
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
        {Object.keys(SHIFT_CODES).map((code) => (
          <ShiftChip key={code} code={code} />
        ))}
      </Box>

    </Box>
  );
}

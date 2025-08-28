import * as React from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, TextField, Menu, MenuItem,
  Stack, IconButton
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/* ---------- Columns ---------- */
const HEADERS = [
  'Date Applied',
  'Full Name',
  'Phone',
  'Pre-DCC',
  'Account ID',
  'DL Verification',
  'BGC',
  'Training',
  'Contracts',
  '', // actions
];

/* ---------- Sample row (UI demo; replace with real data later) ---------- */
const INITIAL_ROWS = [
  {
    id: 'tmp-1',
    dateApplied: '—',
    fullName: '—',
    phone: '—',

    preDccStatus: 'In Review',
    preDccMessage: '',

    accountId: '',

    dlvStatus: 'Pending',
    dlvMessage: '',

    bgcStatus: 'Pending',
    bgcMessage: '',

    trainingDate: '',
    trainingMessage: '',

    contractsDate: '',
    contractsMessage: '',
  },
];

/* ---------- Compact “status selector” with message INSIDE dropdown ---------- */
function StatusMenu({ value, options, onChange, message, onMessage }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #D0D0D0',
          borderRadius: 1,
          px: 0.75,
          height: 26,
          cursor: 'pointer',
          fontSize: 11,
          bgcolor: '#fff',
          minWidth: 110,
        }}
      >
        <Box sx={{ flex: 1, pr: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </Box>
        <ArrowDropDownIcon fontSize="small" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { minWidth: 300, maxWidth: 360 } }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt}
            selected={opt === value}
            onClick={() => onChange(opt)}
            sx={{ fontSize: 12 }}
          >
            {opt}
          </MenuItem>
        ))}
        <Box sx={{ p: 1.5, borderTop: '1px solid #eee' }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Message to candidate"
            value={message}
            onChange={(e) => onMessage(e.target.value)}
            sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}
          />
        </Box>
      </Menu>
    </>
  );
}

/* ---------- Compact “date picker” with message INSIDE dropdown ---------- */
function formatDateLabel(value) {
  if (!value) return 'dd/mm/yyyy';
  const [y, m, d] = value.split('-'); // yyyy-mm-dd
  return `${d}/${m}/${y}`;
}

function DateMenu({ value, onChange, message, onMessage }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #D0D0D0',
          borderRadius: 1,
          px: 0.75,
          height: 26,
          cursor: 'pointer',
          fontSize: 11,
          bgcolor: '#fff',
          minWidth: 110,
        }}
      >
        <Box sx={{ flex: 1, pr: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatDateLabel(value)}
        </Box>
        <ArrowDropDownIcon fontSize="small" />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { minWidth: 320, maxWidth: 380 } }}
      >
        <Box sx={{ p: 1.5 }}>
          <Stack spacing={1.25}>
            <TextField
              size="small"
              type="date"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-input': { fontSize: 11, height: 26, p: '0 8px' } }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Message to candidate"
              value={message}
              onChange={(e) => onMessage(e.target.value)}
              sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}
            />
          </Stack>
        </Box>
      </Menu>
    </>
  );
}

/* ---------- Small table cell helper ---------- */
function Cell({ children, bold, sx }) {
  return (
    <TableCell
      sx={{
        borderColor: '#D9D9D9',
        borderBottom: '1px solid #D9D9D9',
        fontWeight: bold ? 700 : 400,
        whiteSpace: 'nowrap',
        fontSize: 11,
        py: 0.25,
        px: 0.75,
        ...sx,
      }}
    >
      {children}
    </TableCell>
  );
}

/* ---------- Page ---------- */
export default function Onboarding() {
  const [rows, setRows] = React.useState(INITIAL_ROWS);

  // row action menu state
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [menuRowId, setMenuRowId] = React.useState(null);
  const openActions = Boolean(menuAnchor);

  const updateRow = (rowId, patch) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  };

  const handleOpenActions = (e, rowId) => {
    setMenuAnchor(e.currentTarget);
    setMenuRowId(rowId);
  };
  const handleCloseActions = () => {
    setMenuAnchor(null);
    setMenuRowId(null);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Onboarding</Typography>

      <TableContainer component={Paper} sx={{ p: 0, width: '100%' }}>
        <Table
          size="small"
          stickyHeader
          aria-label="onboarding table"
          sx={{
            width: '100%',
            '& th': {
              fontWeight: 700,
              borderBottom: '1px solid #D0D0D0',
              backgroundColor: '#EFEFEF',
              whiteSpace: 'nowrap',
              fontSize: 12, // header size
              py: 0.6,
              px: 0.75,
            },
          }}
        >
          <TableHead>
            <TableRow>
              {HEADERS.map((h) => (
                <TableCell key={h} sx={{ fontSize: 12 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover sx={{ '&:nth-of-type(even)': { backgroundColor: '#FAFAFA' } }}>
                {/* Date Applied (display) */}
                <Cell sx={{ minWidth: 120 }}>{r.dateApplied}</Cell>

                {/* Full Name — roomier */}
                <Cell bold sx={{ minWidth: 180 }}>{r.fullName}</Cell>

                {/* Phone — roomier */}
                <Cell sx={{ minWidth: 140 }}>{r.phone}</Cell>

                {/* Pre-DCC */}
                <Cell sx={{ minWidth: 110 }}>
                  <StatusMenu
                    value={r.preDccStatus}
                    options={['In Review', 'Need Further Information', 'Complete']}
                    onChange={(v) => updateRow(r.id, { preDccStatus: v })}
                    message={r.preDccMessage}
                    onMessage={(v) => updateRow(r.id, { preDccMessage: v })}
                  />
                </Cell>

                {/* Account ID — wide and fullWidth */}
                <Cell sx={{ minWidth: 100, width: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Enter Account ID"
                    value={r.accountId}
                    onChange={(e) => updateRow(r.id, { accountId: e.target.value })}
                    sx={{ '& .MuiInputBase-input': { fontSize: 11, height: 30, p: '0 10px' } }}
                  />
                </Cell>

                {/* DL Verification */}
                <Cell sx={{ minWidth: 110 }}>
                  <StatusMenu
                    value={r.dlvStatus}
                    options={['Pending', 'Complete']}
                    onChange={(v) => updateRow(r.id, { dlvStatus: v })}
                    message={r.dlvMessage}
                    onMessage={(v) => updateRow(r.id, { dlvMessage: v })}
                  />
                </Cell>

                {/* BGC */}
                <Cell sx={{ minWidth: 110 }}>
                  <StatusMenu
                    value={r.bgcStatus}
                    options={['Pending', 'Complete']}
                    onChange={(v) => updateRow(r.id, { bgcStatus: v })}
                    message={r.bgcMessage}
                    onMessage={(v) => updateRow(r.id, { bgcMessage: v })}
                  />
                </Cell>

                {/* Training */}
                <Cell sx={{ minWidth: 120 }}>
                  <DateMenu
                    value={r.trainingDate}
                    onChange={(v) => updateRow(r.id, { trainingDate: v })}
                    message={r.trainingMessage}
                    onMessage={(v) => updateRow(r.id, { trainingMessage: v })}
                  />
                </Cell>

                {/* Contracts */}
                <Cell sx={{ minWidth: 120 }}>
                  <DateMenu
                    value={r.contractsDate}
                    onChange={(v) => updateRow(r.id, { contractsDate: v })}
                    message={r.contractsMessage}
                    onMessage={(v) => updateRow(r.id, { contractsMessage: v })}
                  />
                </Cell>

                {/* Actions ("…") */}
                <Cell sx={{ minWidth: 48, textAlign: 'right' }}>
                  <IconButton size="small" onClick={(e) => handleOpenActions(e, r.id)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Cell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Row actions menu */}
        <Menu
  anchorEl={menuAnchor}
  open={openActions}
  onClose={handleCloseActions}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  MenuListProps={{
    dense: true,
    disablePadding: true,
    sx: { p: 0.25 }, // trims the big inner padding
  }}
  PaperProps={{
    elevation: 2,
    sx: {
      minWidth: 132,          // smaller box
      borderRadius: 1,        // tighter corners
      '& .MuiMenuItem-root': {
        fontSize: 11,
        lineHeight: 1.2,
        py: 0.4,
        px: 1,
        minHeight: 'unset',
      },
    },
  }}
>
  <MenuItem onClick={handleCloseActions}>Activate</MenuItem>
  <MenuItem onClick={handleCloseActions}>Profile</MenuItem>
  <MenuItem onClick={handleCloseActions}>Documents</MenuItem>
  <MenuItem onClick={handleCloseActions}>Remove</MenuItem>
</Menu>
      </TableContainer>
    </Box>
  );
}

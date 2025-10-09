// client-portal/src/components/common/PhaseTable.jsx
import * as React from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CELL_FONT_PX = 11;          // <— change this to adjust all table & control font sizes

export default function PhaseTable({
  title,              // kept for API compatibility
  rows = [],
  cols = [],
  onProceed,
  onActivate,
  onReturnToPhase1,
  onRemove,
  getRowId,
  renderCell,         // (row, label) => ReactNode | undefined -> undefined falls back to default
}) {
  const [menuEl, setMenuEl] = React.useState(null);
  const [activeRowId, setActiveRowId] = React.useState(null);

  const hasActions = Boolean(onProceed || onActivate || onReturnToPhase1 || onRemove);

  const rowIdOf = React.useCallback(
    (row, idx) => (typeof getRowId === 'function'
      ? getRowId(row, idx)
      : row?.email || row?.id || row?._id || String(idx)),
    [getRowId]
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table
        size="small"
        sx={{
          // Unify text + control sizing
          '& th, & td': {
            px: 1.5,
            py: "small",
            fontSize: `${CELL_FONT_PX}px`,
            lineHeight: 1.4,
            verticalAlign: 'middle',
            textAlign: 'center', // ⬅️ center content in each cell
          },
          '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
          '& thead th:last-of-type,  & tbody td:last-of-type':  { pr: 3 },

          // Make all inputs/selects inherit the table size & align neatly
          '& .MuiInputBase-root': {
            height: 22,                 // compact height that works well with 11px text
            fontSize: 'inherit',
            lineHeight: 1.4,
            borderRadius: 1.25,
          },
          // ⬇️ center text inside inputs and selects
          '& .MuiOutlinedInput-input, & .MuiInputBase-input': { textAlign: 'center' },
          '& .MuiSelect-select': { py: 0, minHeight: 'unset', textAlign: 'center' },
          '& .MuiChip-root': { fontSize: 'inherit' },
        }}
      >
        <TableHead>
          <TableRow>
            {cols.map((label) => (
              <TableCell key={label} sx={{ fontWeight: 700 }}>
                {label}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell align="center" sx={{ fontWeight: 700, width: '2%' }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, idx) => {
            const id = rowIdOf(row, idx);
            return (
              <TableRow key={id} hover>
                {cols.map((label) => (
                  <TableCell key={label}>
                    {renderCell
                      ? (() => {
                          const out = renderCell(row, label);
                          return out === undefined ? defaultRender(row, label) : out;
                        })()
                      : defaultRender(row, label)}
                  </TableCell>
                ))}

                {hasActions && (
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      aria-label="more"
                      onClick={(e) => {
                        setMenuEl(e.currentTarget);
                        setActiveRowId(id);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            );
          })}

          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={cols.length + (hasActions ? 1 : 0)}
                sx={{ color: 'text.secondary' }}
              >
                No records.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Menu
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={() => { setMenuEl(null); setActiveRowId(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 140,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          },
        }}
        MenuListProps={{ dense: true, sx: { py: 0 } }}
      >
        {onProceed && (
          <MenuItem
            onClick={() => { onProceed(activeRowId); setMenuEl(null); setActiveRowId(null); }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Proceed
          </MenuItem>
        )}
        {onActivate && (
          <MenuItem
            onClick={() => { onActivate(activeRowId); setMenuEl(null); setActiveRowId(null); }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Activate
          </MenuItem>
        )}
        {onReturnToPhase1 && (
          <MenuItem
            onClick={() => { onReturnToPhase1(activeRowId); setMenuEl(null); setActiveRowId(null); }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Move to Phase 1
          </MenuItem>
        )}
        {onRemove && (
          <MenuItem
            onClick={() => { onRemove(activeRowId); setMenuEl(null); setActiveRowId(null); }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Remove
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
}

function defaultRender(row, label) {
  const keys = [
    label,
    label.replace(/\s+/g, ''),
    label.replace(/\s+/g, '_'),
    label.replace(/\s+/g, '').toLowerCase(),
    label.replace(/\s+/g, '_').toLowerCase(),
    label.toLowerCase(),
  ];
  for (const k of keys) {
    if (k in row) return row[k];
  }
  if (/name/i.test(label) && row.name) return row.name;
  if (/email/i.test(label) && row.email) return row.email;
  if (/phone/i.test(label) && row.phone) return row.phone;
  return '-';
}

// src/components/common/PhaseTable.jsx
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

export default function PhaseTable({
  // kept for compatibility but not rendered
  title,
  rows = [],
  cols = [],
  // Actions (pass whichever you want to show)
  onProceed,          // Phase 1: move to Phase 2
  onActivate,         // Phase 2: activate
  onReturnToPhase1,   // Phase 2: move back to Phase 1
  onRemove,           // Both phases
  // Optional helpers
  getRowId,
  renderCell,         // (row, label) => ReactNode | undefined
}) {
  const [menuEl, setMenuEl] = React.useState(null);
  const [activeRowId, setActiveRowId] = React.useState(null);

  const hasActions = Boolean(onProceed || onActivate || onReturnToPhase1 || onRemove);

  const rowIdOf = React.useCallback(
    (row, idx) => {
      if (typeof getRowId === 'function') return getRowId(row, idx);
      return row?.email || row?.id || row?._id || String(idx);
    },
    [getRowId]
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Title bar intentionally removed so the table starts at headers */}
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
            {cols.map((label) => (
              <TableCell key={label} sx={{ fontWeight: 700 }}>
                {label}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell align="right" sx={{ fontWeight: 700, width: '2%' }}>
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
                          // If your override returns undefined, fall back to default renderer
                          return out === undefined ? defaultRender(row, label) : out;
                        })()
                      : defaultRender(row, label)}
                  </TableCell>
                ))}

                {hasActions && (
                  <TableCell align="right">
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

      {/* Row actions menu */}
      <Menu
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={() => {
          setMenuEl(null);
          setActiveRowId(null);
        }}
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
        {/* Phase 1 */}
        {onProceed && (
          <MenuItem
            onClick={() => {
              onProceed(activeRowId);
              setMenuEl(null);
              setActiveRowId(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Proceed
          </MenuItem>
        )}

        {/* Phase 2 */}
        {onActivate && (
          <MenuItem
            onClick={() => {
              onActivate(activeRowId);
              setMenuEl(null);
              setActiveRowId(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Activate
          </MenuItem>
        )}
        {onReturnToPhase1 && (
          <MenuItem
            onClick={() => {
              onReturnToPhase1(activeRowId);
              setMenuEl(null);
              setActiveRowId(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Move to Phase 1
          </MenuItem>
        )}

        {/* Both phases */}
        {onRemove && (
          <MenuItem
            onClick={() => {
              onRemove(activeRowId);
              setMenuEl(null);
              setActiveRowId(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Remove
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
}

/**
 * Basic default cell renderer:
 * - Tries common key variants to map a header label to a row field.
 * - Falls back to '-', and special-cases name/email/phone.
 */
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

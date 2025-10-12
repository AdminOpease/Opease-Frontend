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
  TableFooter,
  TablePagination,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';

const CELL_FONT_PX = 11; // global table/control font size

export default function PhaseTable({
  title,
  rows = [],
  cols = [],
  onProceed,
  onActivate,
  onReturnToPhase1,
  onRemove,
  getRowId,
  renderCell,
  // Pagination
  paginate = false,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 25,
  // New additions
  profilePathFor,
  documentsPathFor,
}) {
  const navigate = useNavigate();
  const [menuEl, setMenuEl] = React.useState(null);
  const [activeRow, setActiveRow] = React.useState(null);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);

  const hasActions = Boolean(
    onProceed || onActivate || onReturnToPhase1 || onRemove || profilePathFor || documentsPathFor
  );

  const rowIdOf = React.useCallback(
    (row, idx) =>
      typeof getRowId === 'function'
        ? getRowId(row, idx)
        : row?.email || row?.id || row?._id || String(idx),
    [getRowId]
  );

  const pagedRows = React.useMemo(() => {
    if (!paginate) return rows;
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, paginate, page, rowsPerPage]);

  React.useEffect(() => {
    if (!paginate) return;
    const maxPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(0);
  }, [rows, rowsPerPage, page, paginate]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table
        size="small"
        sx={{
          '& th, & td': {
            px: 1.5,
            py: 'small',
            fontSize: `${CELL_FONT_PX}px`,
            lineHeight: 1.4,
            verticalAlign: 'middle',
            textAlign: 'center',
          },
          '& thead th:first-of-type, & tbody td:first-of-type': { pl: 3 },
          '& thead th:last-of-type,  & tbody td:last-of-type': { pr: 3 },
          '& .MuiInputBase-root': {
            height: 22,
            fontSize: 'inherit',
            lineHeight: 1.4,
            borderRadius: 1.25,
          },
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
          {pagedRows.map((row, idx) => {
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
                        setActiveRow(row);
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

        {paginate && rows.length > 0 && (
          <TableFooter>
            <TableRow>
              <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={rowsPerPageOptions}
                labelRowsPerPage="Rows"
                sx={{
                  width: '100%',
                  '& .MuiTablePagination-toolbar': { minHeight: 32, px: 1 },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: '11px',
                  },
                  '& .MuiInputBase-root': { fontSize: '11px' },
                  '& .MuiTablePagination-actions button': { p: 0.25 },
                }}
              />
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <Menu
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={() => {
          setMenuEl(null);
          setActiveRow(null);
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
        {profilePathFor && activeRow && (
          <MenuItem
            onClick={() => {
              navigate(profilePathFor(activeRow));
              setMenuEl(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Profile
          </MenuItem>
        )}
        {documentsPathFor && activeRow && (
          <MenuItem
            onClick={() => {
              navigate(documentsPathFor(activeRow));
              setMenuEl(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Documents
          </MenuItem>
        )}
        {onProceed && (
          <MenuItem
            onClick={() => {
              onProceed(activeRow?.email);
              setMenuEl(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Proceed
          </MenuItem>
        )}
        {onActivate && (
          <MenuItem
            onClick={() => {
              onActivate(activeRow?.email);
              setMenuEl(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Activate
          </MenuItem>
        )}
        {onReturnToPhase1 && (
          <MenuItem
            onClick={() => {
              onReturnToPhase1(activeRow?.email);
              setMenuEl(null);
            }}
            sx={{ justifyContent: 'center', px: 1.25, py: 0.6, fontSize: 13 }}
          >
            Move to Phase 1
          </MenuItem>
        )}
        {onRemove && (
          <MenuItem
            onClick={() => {
              onRemove(activeRow?.email);
              setMenuEl(null);
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

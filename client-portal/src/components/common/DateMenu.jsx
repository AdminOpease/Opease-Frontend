// src/components/common/DateMenu.jsx
import * as React from 'react';
import { Box, Menu, TextField, Stack } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// helper (same formatting as your page)
function formatDateLabel(value) {
  if (!value) return 'dd/mm/yyyy';
  const [y, m, d] = value.split('-'); // yyyy-mm-dd
  return `${d}/${m}/${y}`;
}

// Shared copy of your compact date + message menu
export default function DateMenuCompact({ value, onChange, message, onMessage, minWidth = 110 }) {
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
          minWidth,
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
              onChange={(e) => onChange?.(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-input': { fontSize: 11, height: 26, p: '0 8px' } }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Message to candidate"
              value={message}
              onChange={(e) => onMessage?.(e.target.value)}
              sx={{ '& .MuiInputBase-root': { fontSize: 13 } }}
            />
          </Stack>
        </Box>
      </Menu>
    </>
  );
}

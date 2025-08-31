// src/components/common/StatusMenu.jsx
import * as React from 'react';
import { Box, Menu, MenuItem, TextField } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Shared copy of your compact Status menu, exported as StatusMenuCompact
export default function StatusMenuCompact({ value, options, onChange, message, onMessage, minWidth = 110 }) {
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

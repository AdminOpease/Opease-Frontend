// src/components/operations/ShiftChip.jsx
import * as React from 'react';
import { Box } from '@mui/material';
import { SHIFT_CODES } from '../../data/rotaDemoData';

export default function ShiftChip({ code, onClick }) {
  if (!code) return null;

  const style = SHIFT_CODES[code];
  if (!style) return <Box sx={{ fontSize: 11, textAlign: 'center' }}>{code}</Box>;

  return (
    <Box
      onClick={onClick}
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
        lineHeight: 1,
        color: style.color,
        bgcolor: style.bg,
        border: '1px solid',
        borderColor: style.color + '30',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...(onClick && { cursor: 'pointer', '&:hover': { opacity: 0.8 } }),
      }}
    >
      {code}
    </Box>
  );
}

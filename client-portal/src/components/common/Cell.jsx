// src/components/common/Cell.jsx
import * as React from 'react';
import { TableCell } from '@mui/material';

export default function Cell({ children, bold = false, sx }) {
  return (
    <TableCell
      sx={{
        borderColor: '#D9D9D9',
        borderBottom: '1px solid #D9D9D9',
        whiteSpace: 'nowrap',
        fontSize: 11,
        fontWeight: bold ? 700 : 400,
        py: 0.25,
        px: 0.75,
        ...sx,
      }}
    >
      {children}
    </TableCell>
  );
}

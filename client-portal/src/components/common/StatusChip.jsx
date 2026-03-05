// src/components/common/StatusChip.jsx
import * as React from 'react';
import { Chip } from '@mui/material';

const STYLES = {
  Onboarding: {
    bg: '#EAF3FF', text: '#0B66C3', border: '#B7D3F5',
  },
  Active: {
    bg: '#EAF7EA', text: '#2E7D32', border: '#B9E0BA',
  },
  Inactive: {
    bg: '#FFF6E5', text: '#B26A00', border: '#F3D3A6',
  },
  Offboarded: {
    bg: '#FBE9E9', text: '#C62828', border: '#F3B9B9',
  },
  // Rota statuses
  'Full Time': {
    bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7',
  },
  'Part Time': {
    bg: '#FFF3E0', text: '#E65100', border: '#FFCC80',
  },
  'Lead Driver': {
    bg: '#E3F2FD', text: '#0D47A1', border: '#90CAF9',
  },
  OSM: {
    bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8',
  },
};

export default function StatusChip({ status = 'Onboarding', sx, ...props }) {
  const s = STYLES[status] || STYLES.Onboarding;

  return (
    <Chip
      label={status}
      size="small"
      variant="outlined"
      sx={{
        fontSize: 11,
        height: 22,
        borderRadius: 999,
        px: 0.5,
        color: s.text,
        bgcolor: s.bg,
        borderColor: s.border,
        ...sx,
      }}
      {...props}
    />
  );
}

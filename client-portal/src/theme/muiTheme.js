// src/theme/muiTheme.js
import { createTheme } from '@mui/material/styles';

const BORDER = '#D9D9D9';
const HEADER_BG = '#EFEFEF';

const theme = createTheme({
  typography: {
    fontSize: 12, // base; we’ll override table/body below
  },
  components: {
    MuiTable: {
      defaultProps: {
        size: 'small',
        stickyHeader: true,
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: 11,
          paddingTop: 2,
          paddingBottom: 2,
          paddingLeft: 6,
          paddingRight: 6,
          whiteSpace: 'nowrap',
          borderBottom: `1px solid ${BORDER}`,
        },
        head: {
          fontWeight: 700,
          fontSize: 12,
          backgroundColor: HEADER_BG,
          borderBottom: `1px solid ${BORDER}`,
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { backgroundColor: '#FAFAFA' },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        // keep popovers tight like your sample
        transformOrigin: { vertical: 'top', horizontal: 'left' },
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      },
      styleOverrides: {
        paper: {
          borderRadius: 4,
          minWidth: 300, // matches your Status/Date menus
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 11,
          lineHeight: 1.2,
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 8,
          paddingRight: 8,
          minHeight: 'unset',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: 11,
            height: 30,
            padding: '0 10px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // light borders on tables/containers to match your look
          borderColor: BORDER,
        },
      },
    },
  },
});

export default theme;

// src/components/common/UploadDocumentDialog.jsx
import * as React from 'react';
import {
  Dialog, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Typography, Box, Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const DOC_TYPES = [
  "Driver's Licence",
  'Identification',
  'Right to Work',
  'National Insurance',
  'Proof of Address',
  'Contracts',
  'Other',
];

const fieldSx = { '& .MuiInputBase-root': { height: 36 } };

const dropZoneSx = (isDragging) => ({
  border: '2px dashed',
  borderColor: isDragging ? 'primary.main' : 'divider',
  borderRadius: 2,
  bgcolor: isDragging ? 'rgba(46,76,30,0.04)' : '#FAFAFA',
  p: 3,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(46,76,30,0.02)' },
});

export default function UploadDocumentDialog({ open, onClose, onSubmit }) {
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState(DOC_TYPES[0]);
  const [expiryDate, setExpiryDate] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) {
      setTitle('');
      setType(DOC_TYPES[0]);
      setExpiryDate('');
      setFiles([]);
      setIsDragging(false);
    }
  }, [open]);

  const handleFiles = (e) => setFiles(Array.from(e.target.files || []));

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) setFiles(dropped);
  };

  const canSubmit = title.trim().length > 0 && files.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <UploadFileIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Upload Document</Typography>
        </Stack>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2}>
          {/* Title */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Document Title</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., Driving Licence Front"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={fieldSx}
            />
          </Box>

          {/* File drop zone */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>File</Typography>
            <Box
              sx={dropZoneSx(isDragging)}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={inputRef} type="file" hidden multiple onChange={handleFiles} />
              {files.length === 0 ? (
                <>
                  <CloudUploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                    Click to upload or drag and drop
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                    PDF, JPG, PNG up to 10MB
                  </Typography>
                </>
              ) : (
                <Stack spacing={0.5} alignItems="center">
                  <InsertDriveFileIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {files.map((f) => f.name).join(', ')}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>

          {/* Type + Expiry side by side */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Document Type</Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={fieldSx}
              >
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75 }}>Expiry Date <Typography component="span" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 400 }}>(optional)</Typography></Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 600, px: 2, color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit?.({ title: title.trim(), files, type, expiryDate: expiryDate || null })}
          size="small"
          variant="contained"
          disabled={!canSubmit}
          startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
          sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700, px: 2.5 }}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

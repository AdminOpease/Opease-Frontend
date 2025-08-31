// src/components/common/UploadDocumentDialog.jsx
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Typography
} from '@mui/material';

const DOC_TYPES = [
  'Driver’s Licence',
  'Identification',
  'Right to Work',
  'National Insurance',
  'Proof of Address',
  'Contracts',
  'Other',
];

export default function UploadDocumentDialog({
  open,
  onClose,
  onSubmit,            // ({ title, files, type, expiryDate }) => void
}) {
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState(DOC_TYPES[0]);
  const [expiryDate, setExpiryDate] = React.useState(''); // optional
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    if (!open) {
      setTitle('');
      setType(DOC_TYPES[0]);
      setExpiryDate('');
      setFiles([]);
    }
  }, [open]);

  const handleFiles = (e) => setFiles(Array.from(e.target.files || []));

  const canSubmit = title.trim().length > 0 && files.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ py: 1.25, fontSize: 16, fontWeight: 700 }}>
        Upload Document
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        <Stack spacing={1.25}>
          <TextField
            label="Title"
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            helperText="Give the document a clear name (e.g., Driving Licence Front)"
          />

          <Button
            component="label"
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Choose file(s)
            <input type="file" hidden multiple onChange={handleFiles} />
          </Button>
          {files.length > 0 && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {files.length} file(s) selected
            </Typography>
          )}

          <TextField
            select
            label="Document Type"
            size="small"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {DOC_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Expiry Date (optional)"
            size="small"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Not required. Add if the document has an expiry."
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 1.25 }}>
        <Button onClick={onClose} size="small" variant="text">Cancel</Button>
        <Button
          onClick={() => onSubmit?.({ title: title.trim(), files, type, expiryDate: expiryDate || null })}
          size="small"
          variant="contained"
          disabled={!canSubmit}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

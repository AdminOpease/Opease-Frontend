// src/components/common/ConfirmDialog.jsx
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Checkbox, FormControlLabel, Stack
} from '@mui/material';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  subtitle,                 // optional small text under title
  message,                  // optional body text
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'warning',         // 'warning' | 'danger' | 'default'
  requireAcknowledge = false,
  acknowledgeLabel = 'I understand this action cannot be undone.',
  onConfirm,
  onClose,
}) {
  const [ack, setAck] = React.useState(false);

  React.useEffect(() => {
    if (!open) setAck(false);
  }, [open]);

  const colorMap = {
    warning: 'warning',
    danger: 'error',
    default: 'primary',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ py: 1.25, fontSize: 16, fontWeight: 700 }}>
        {title}
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: 12 }}>
            {subtitle}
          </Typography>
        )}
      </DialogTitle>

      {(message || requireAcknowledge) && (
        <DialogContent sx={{ pt: 0.5, pb: 0, fontSize: 13 }}>
          <Stack spacing={1.25}>
            {message && (
              <Typography variant="body2" sx={{ fontSize: 13, color: 'text.primary' }}>
                {message}
              </Typography>
            )}

            {requireAcknowledge && (
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                  />
                }
                sx={{ '.MuiFormControlLabel-label': { fontSize: 12 } }}
                label={acknowledgeLabel}
              />
            )}
          </Stack>
        </DialogContent>
      )}

      <DialogActions sx={{ p: 1.25 }}>
        <Button onClick={onClose} variant="text" size="small">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          size="small"
          variant="contained"
          color={colorMap[tone] || 'primary'}
          disabled={requireAcknowledge && !ack}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

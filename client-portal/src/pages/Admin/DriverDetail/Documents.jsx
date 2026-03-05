// src/pages/Admin/DriverDetail/Documents.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Button, Stack, Chip, Divider,
  Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useParams } from 'react-router-dom';
import UploadDocumentDialog from '../../../components/common/UploadDocumentDialog.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import { useAppStore } from '../../../state/AppStore.jsx';

const todayISO = () => new Date().toISOString().slice(0, 10);
const msInDay = 24 * 60 * 60 * 1000;
const within30Days = (deletedAt) => {
  if (!deletedAt) return false;
  return Date.now() - new Date(deletedAt).getTime() <= 30 * msInDay;
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return Math.ceil((d - new Date()) / msInDay);
}

// --- Extracted styles ---
const tablePaperSx = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
};

const filterBtnSx = (active) => ({
  borderRadius: 9999,
  textTransform: 'none',
  fontWeight: active ? 700 : 600,
  px: 1.5,
  fontSize: 12,
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'divider',
  color: active ? 'primary.main' : 'text.secondary',
  bgcolor: active ? 'rgba(46,76,30,0.06)' : 'transparent',
  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(46,76,30,0.04)' },
});

const thSx = { fontWeight: 700, fontSize: 12 };

function ExpiryCell({ date }) {
  if (!date) return <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>&mdash;</Typography>;
  const days = daysUntil(date);
  const isExpired = days !== null && days < 0;
  const isExpiring = days !== null && days >= 0 && days <= 30;
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Typography sx={{ fontSize: 12 }}>{date}</Typography>
      {isExpired && (
        <Chip label="Expired" size="small" sx={{ fontSize: 10, height: 18, borderRadius: 999, bgcolor: '#FBE9E9', color: '#C62828', borderColor: '#F3B9B9' }} variant="outlined" />
      )}
      {isExpiring && (
        <Chip label={`${days}d`} size="small" sx={{ fontSize: 10, height: 18, borderRadius: 999, bgcolor: '#FFF6E5', color: '#B26A00', borderColor: '#F3D3A6' }} variant="outlined" />
      )}
    </Stack>
  );
}

export default function DriverDocuments() {
  const { email } = useParams();
  const { drivers, documents, setDocuments } = useAppStore();

  const driver = React.useMemo(
    () => drivers.find((d) => d.email === email),
    [drivers, email],
  );

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState({ open: false, docId: null });
  const [moveConfirm, setMoveConfirm] = React.useState({ open: false, docId: null });
  const [view, setView] = React.useState('active'); // 'active' | 'archived' | 'deleted'

  const docsForDriver = React.useMemo(
    () => documents.filter((d) => d.driverEmail === email),
    [documents, email],
  );

  const activeRows   = docsForDriver.filter((d) => !d.deletedAt && d.status !== 'archived');
  const archivedRows = docsForDriver.filter((d) => d.status === 'archived' && !d.deletedAt);
  const deletedRows  = docsForDriver.filter((d) => d.deletedAt && within30Days(d.deletedAt));

  const rowsToRender = view === 'deleted' ? deletedRows : view === 'archived' ? archivedRows : activeRows;
  const counts = { active: activeRows.length, archived: archivedRows.length, deleted: deletedRows.length };

  return (
    <Box>
      {/* Filter pills + Upload — single row */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => setView('active')} sx={filterBtnSx(view === 'active')}>
          Active ({counts.active})
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ArchiveIcon sx={{ fontSize: 14 }} />}
          onClick={() => setView('archived')}
          sx={filterBtnSx(view === 'archived')}
        >
          Archived ({counts.archived})
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
          onClick={() => setView('deleted')}
          sx={filterBtnSx(view === 'deleted')}
        >
          Deleted ({counts.deleted})
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          variant="contained"
          startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
          onClick={() => setUploadOpen(true)}
          sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700, px: 2 }}
        >
          Upload
        </Button>
      </Stack>

      {/* Table */}
      <Paper variant="outlined" sx={tablePaperSx}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...thSx, pl: 2 }}>Title</TableCell>
              <TableCell sx={thSx}>Type</TableCell>
              <TableCell sx={thSx}>Uploaded</TableCell>
              <TableCell sx={thSx}>Expiry</TableCell>
              <TableCell sx={thSx} align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsToRender.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell sx={{ pl: 2, fontWeight: 600, fontSize: 12 }}>{doc.title}</TableCell>
                <TableCell>
                  <Chip
                    label={doc.type}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 11, height: 22, borderRadius: 999, borderColor: 'divider' }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{doc.uploadedAt}</TableCell>
                <TableCell><ExpiryCell date={doc.expiryDate} /></TableCell>
                <TableCell align="right">
                  {view === 'active' && (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Button size="small" variant="text" sx={{ fontSize: 11, textTransform: 'none', minWidth: 0 }}>Preview</Button>
                      <Button size="small" variant="text" sx={{ fontSize: 11, textTransform: 'none', minWidth: 0 }}>Download</Button>
                      <Button
                        size="small"
                        variant="text"
                        sx={{ fontSize: 11, textTransform: 'none', minWidth: 0 }}
                        onClick={() => setMoveConfirm({ open: true, docId: doc.id })}
                      >
                        Move
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        sx={{ fontSize: 11, textTransform: 'none', minWidth: 0 }}
                        onClick={() => setConfirm({ open: true, docId: doc.id })}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}
                  {view === 'deleted' && (
                    <Button
                      size="small"
                      variant="text"
                      sx={{ fontSize: 11, textTransform: 'none' }}
                      onClick={() => {
                        setDocuments((prev) =>
                          prev.map((d) => (d.id === doc.id ? { ...d, deletedAt: null } : d))
                        );
                      }}
                    >
                      Restore
                    </Button>
                  )}
                  {view === 'archived' && (
                    <Button
                      size="small"
                      variant="text"
                      sx={{ fontSize: 11, textTransform: 'none' }}
                      onClick={() => {
                        setDocuments((prev) =>
                          prev.map((d) =>
                            d.id === doc.id ? { ...d, status: 'active', archivedAt: null } : d
                          )
                        );
                      }}
                    >
                      Unarchive
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rowsToRender.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600 }}>
                    {view === 'deleted' ? 'No items in recycle bin' : view === 'archived' ? 'No archived documents' : 'No documents uploaded yet'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                    {view === 'active' ? 'Upload a document to get started.' : ''}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Upload dialog */}
      <UploadDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={({ title, files, type, expiryDate }) => {
          const newDoc = {
            id: String(Date.now()),
            title,
            type,
            uploadedAt: todayISO(),
            expiryDate: expiryDate || null,
            status: 'active',
            deletedAt: null,
            archivedAt: null,
            driverEmail: email,
            driverName: driver?.name || email,
            depot: driver?.depot || 'Heathrow',
          };
          setDocuments((prev) => [newDoc, ...prev]);
          setUploadOpen(false);
        }}
      />

      {/* Soft-delete confirmation */}
      <ConfirmDialog
        open={confirm.open}
        title="Move to recycle bin?"
        subtitle="This document will be recoverable for 30 days."
        message="After 30 days, it will be permanently deleted."
        confirmLabel="Move to bin"
        cancelLabel="Cancel"
        tone="warning"
        requireAcknowledge={true}
        acknowledgeLabel="I understand this will be permanently deleted after 30 days."
        onConfirm={() => {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === confirm.docId ? { ...d, deletedAt: new Date().toISOString() } : d
            )
          );
          setConfirm({ open: false, docId: null });
        }}
        onClose={() => setConfirm({ open: false, docId: null })}
      />

      {/* Move to Archive confirmation */}
      <ConfirmDialog
        open={moveConfirm.open}
        title="Move to Archive?"
        subtitle="This will archive the document."
        message="You can unarchive later if needed."
        confirmLabel="Move to Archive"
        cancelLabel="Cancel"
        tone="default"
        requireAcknowledge={false}
        onConfirm={() => {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === moveConfirm.docId
                ? { ...d, status: 'archived', archivedAt: new Date().toISOString() }
                : d
            )
          );
          setMoveConfirm({ open: false, docId: null });
        }}
        onClose={() => setMoveConfirm({ open: false, docId: null })}
      />
    </Box>
  );
}

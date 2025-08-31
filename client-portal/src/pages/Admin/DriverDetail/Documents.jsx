// src/pages/Admin/DriverDetail/Documents.jsx
import * as React from 'react';
import {
  Box, Typography, Paper, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { useParams } from 'react-router-dom';
import UploadDocumentDialog from '../../../components/common/UploadDocumentDialog.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import { useAppStore } from '../../../state/AppStore.jsx';

const todayISO = () => new Date().toISOString().slice(0, 10); // yyyy-mm-dd
const msInDay = 24 * 60 * 60 * 1000;
const within30Days = (deletedAt) => {
  if (!deletedAt) return false;
  const diff = Date.now() - new Date(deletedAt).getTime();
  return diff <= 30 * msInDay;
};

export default function DriverDocuments() {
  const { email } = useParams();
  const { drivers, documents, setDocuments } = useAppStore();

  const driver = React.useMemo(
    () => drivers.find((d) => d.email === email),
    [drivers, email]
  );

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState({ open: false, docId: null });         // delete -> recycle bin
  const [moveConfirm, setMoveConfirm] = React.useState({ open: false, docId: null }); // move -> Old (archive)
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [showArchived, setShowArchived] = React.useState(false);

  // Slice documents for this driver
  const docsForDriver = React.useMemo(
    () => documents.filter((d) => d.driverEmail === email),
    [documents, email]
  );

  const activeRows   = docsForDriver.filter((d) => !d.deletedAt && d.status !== 'archived');
  const archivedRows = docsForDriver.filter((d) => d.status === 'archived' && !d.deletedAt);
  const deletedRows  = docsForDriver.filter((d) => d.deletedAt && within30Days(d.deletedAt));

  const rowsToRender = showDeleted ? deletedRows : showArchived ? archivedRows : activeRows;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Documents</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="text" onClick={() => setShowArchived(v => !v)}>
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button size="small" variant="text" onClick={() => setShowDeleted((v) => !v)}>
            {showDeleted ? 'Show Active' : 'Recently Deleted'}
          </Button>
          <Button size="small" variant="contained" onClick={() => setUploadOpen(true)}>
            Upload
          </Button>
        </Stack>
      </Stack>

      <Paper>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell>Expiry (optional)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowsToRender.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell sx={{ minWidth: 200 }}>{doc.title}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.uploadedAt}</TableCell>
                <TableCell>{doc.expiryDate || '—'}</TableCell>
                <TableCell>
                  {showDeleted
                    ? (() => {
                        const remaining =
                          30 - Math.floor((Date.now() - new Date(doc.deletedAt).getTime()) / msInDay);
                        return `Deleted • ${Math.max(0, remaining)}d left`;
                      })()
                    : (doc.status === 'archived' ? 'Archived (Old)' : doc.status)}
                </TableCell>
                <TableCell align="right">
                  {!showDeleted && !showArchived ? (
                    <>
                      <Button size="small" variant="text">Preview</Button>
                      <Button size="small" variant="text">Download</Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setMoveConfirm({ open: true, docId: doc.id })}
                      >
                        Move
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        onClick={() => setConfirm({ open: true, docId: doc.id })}
                      >
                        Delete
                      </Button>
                    </>
                  ) : showDeleted ? (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setDocuments((prev) =>
                          prev.map((d) => (d.id === doc.id ? { ...d, deletedAt: null } : d))
                        );
                      }}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setDocuments(prev =>
                          prev.map(d =>
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
                <TableCell colSpan={6} sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {showDeleted ? 'No items in recycle bin.' : showArchived ? 'No archived documents.' : 'No documents to show.'}
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
            expiryDate: expiryDate || null, // optional
            status: 'active',
            deletedAt: null,
            archivedAt: null,
            // store fields needed by Dashboard / ExpiringDocs
            driverEmail: email,
            driverName: driver?.name || email,
            depot: driver?.depot || 'Heathrow', // fallback if driver missing
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

      {/* Move to Old (archive) confirmation */}
      <ConfirmDialog
        open={moveConfirm.open}
        title="Move to Old?"
        subtitle="This will archive the document under its type’s Old folder."
        message="You can unarchive later if needed."
        confirmLabel="Move to Old"
        cancelLabel="Cancel"
        tone="default"
        requireAcknowledge={false}
        onConfirm={() => {
          setDocuments(prev =>
            prev.map(d =>
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

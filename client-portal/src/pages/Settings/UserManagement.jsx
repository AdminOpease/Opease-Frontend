import * as React from 'react';
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Checkbox, FormControlLabel, Chip, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { portalUsers } from '../../services/api';
import { useAppStore } from '../../state/AppStore';

const PAGE_KEYS = [
  { key: 'admin/drivers', label: 'Drivers', section: 'Admin & Compliance' },
  { key: 'admin/stations', label: 'Stations', section: 'Admin & Compliance' },
  { key: 'admin/expiring-docs', label: 'Expiring Documents', section: 'Admin & Compliance' },
  { key: 'admin/change-requests', label: 'Change Requests', section: 'Admin & Compliance' },
  { key: 'operations/rota', label: 'Rota', section: 'Operations' },
  { key: 'operations/vans', label: 'Van Assignment', section: 'Operations' },
  { key: 'operations/plan', label: 'Daily Plan', section: 'Operations' },
  { key: 'operations/working-hours', label: 'Working Hours', section: 'Operations' },
  { key: 'recruitment/onboarding', label: 'Onboarding', section: 'Recruitment' },
  { key: 'recruitment/dashboard', label: 'Recruitment Dashboard', section: 'Recruitment' },
  { key: 'recruitment/removed', label: 'Removed', section: 'Recruitment' },
  { key: 'settings/users', label: 'User Management', section: 'Settings' },
];

const SECTIONS = [...new Set(PAGE_KEYS.map((p) => p.section))];

export default function UserManagement() {
  const { depots } = useAppStore();
  const [users, setUsers] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);

  // Form state
  const [form, setForm] = React.useState({ email: '', password: '', firstName: '', lastName: '', isSuperAdmin: false });
  const [selectedPerms, setSelectedPerms] = React.useState([]);
  const [selectedDepots, setSelectedDepots] = React.useState([]);

  const fetchUsers = React.useCallback(async () => {
    try {
      const res = await portalUsers.list();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleNew = () => {
    setEditUser(null);
    setForm({ email: '', password: '', firstName: '', lastName: '', isSuperAdmin: false });
    setSelectedPerms([]);
    setSelectedDepots([]);
    setDialogOpen(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
    });
    setSelectedPerms(user.permissions || []);
    setSelectedDepots(user.depots || []);
    setDialogOpen(true);
  };

  const togglePerm = (key) => {
    setSelectedPerms((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const toggleDepot = (code) => {
    setSelectedDepots((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  };

  const handleSave = async () => {
    try {
      if (editUser) {
        const patch = { firstName: form.firstName, lastName: form.lastName, isSuperAdmin: form.isSuperAdmin };
        if (form.password) patch.password = form.password;
        if (form.email !== editUser.email) patch.email = form.email;
        await portalUsers.update(editUser.id, patch);
        await portalUsers.setPermissions(editUser.id, selectedPerms);
        await portalUsers.setDepots(editUser.id, selectedDepots);
      } else {
        const res = await portalUsers.create({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          isSuperAdmin: form.isSuperAdmin,
          permissions: selectedPerms,
          depots: selectedDepots,
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Failed to save: ' + (err.message || err));
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    await portalUsers.remove(id);
    fetchUsers();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}
          sx={{ bgcolor: '#2E4C1E', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#3d6528' } }}>
          Add User
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F5F5F5' }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Depots</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pages</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{u.email}</TableCell>
                <TableCell>
                  <Chip size="small" label={u.isSuperAdmin ? 'Super Admin' : 'Staff'}
                    sx={{ fontWeight: 600, fontSize: 11, bgcolor: u.isSuperAdmin ? '#E8F5E9' : '#F5F5F5', color: u.isSuperAdmin ? '#1B5E20' : '#616161' }} />
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {u.isSuperAdmin ? 'All' : (u.depots?.join(', ') || '—')}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {u.isSuperAdmin ? 'All' : `${u.permissions?.length || 0} pages`}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={u.isActive ? 'Active' : 'Inactive'}
                    sx={{ fontWeight: 600, fontSize: 11, bgcolor: u.isActive ? '#E8F5E9' : '#FFEBEE', color: u.isActive ? '#1B5E20' : '#B71C1C' }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(u)}><EditIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="First Name" fullWidth value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <TextField size="small" label="Last Name" fullWidth value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Box>
          <TextField size="small" label="Email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField size="small" label={editUser ? 'New Password (leave blank to keep)' : 'Password'} type="password" fullWidth
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <FormControlLabel
            control={<Checkbox checked={form.isSuperAdmin} onChange={(e) => setForm({ ...form, isSuperAdmin: e.target.checked })} />}
            label={<Typography sx={{ fontSize: 13, fontWeight: 600 }}>Super Admin (full access to everything)</Typography>}
          />

          {!form.isSuperAdmin && (
            <>
              <Divider />
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Depot Access</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {depots.map((code) => (
                  <Chip key={code} label={code} size="small" clickable
                    onClick={() => toggleDepot(code)}
                    sx={{
                      fontWeight: 600, fontSize: 12,
                      bgcolor: selectedDepots.includes(code) ? '#E8F5E9' : '#F5F5F5',
                      color: selectedDepots.includes(code) ? '#1B5E20' : '#616161',
                      border: selectedDepots.includes(code) ? '1px solid #1B5E20' : '1px solid #E0E0E0',
                    }}
                  />
                ))}
              </Box>

              <Divider />
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Page Access</Typography>
              {SECTIONS.map((section) => (
                <Box key={section}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>{section}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {PAGE_KEYS.filter((p) => p.section === section).map((p) => (
                      <Chip key={p.key} label={p.label} size="small" clickable
                        onClick={() => togglePerm(p.key)}
                        sx={{
                          fontWeight: 600, fontSize: 11,
                          bgcolor: selectedPerms.includes(p.key) ? '#E3F2FD' : '#F5F5F5',
                          color: selectedPerms.includes(p.key) ? '#0D47A1' : '#616161',
                          border: selectedPerms.includes(p.key) ? '1px solid #0D47A1' : '1px solid #E0E0E0',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editUser && !editUser.isSuperAdmin && (
            <Button size="small" color="error" onClick={() => { handleDeactivate(editUser.id); setDialogOpen(false); }}
              sx={{ mr: 'auto', textTransform: 'none' }}>
              Deactivate
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleSave} variant="contained" size="small"
            disabled={!form.email || !form.firstName || !form.lastName || (!editUser && !form.password)}>
            {editUser ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

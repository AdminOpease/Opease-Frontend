const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // Add auth token if available
  const token = localStorage.getItem('opease:token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `API ${res.status}`);
  }
  return res.json();
}

function get(path) { return request(path); }
function post(path, data) { return request(path, { method: 'POST', body: JSON.stringify(data) }); }
function patch(path, data) { return request(path, { method: 'PATCH', body: JSON.stringify(data) }); }
function del(path) { return request(path, { method: 'DELETE' }); }

// ─── Drivers ──────────────────────────────────────
export const drivers = {
  list: (params) => get(`/drivers?${qs(params)}`),
  getById: (id) => get(`/drivers/${id}`),
  create: (data) => post('/drivers', data),
  update: (id, data) => patch(`/drivers/${id}`, data),
  updateStatus: (id, data) => patch(`/drivers/${id}/status`, data),
  invite: (id) => post(`/drivers/${id}/invite`),
  resetPassword: (id, password) => post(`/drivers/${id}/reset-password`, { password }),
};

// ─── Applications ─────────────────────────────────
export const applications = {
  list: (params) => get(`/applications?${qs(params)}`),
  getById: (id) => get(`/applications/${id}`),
  update: (id, data) => patch(`/applications/${id}`, data),
  activate: (id) => post(`/applications/${id}/activate`),
  remove: (id, comment) => post(`/applications/${id}/remove`, { comment }),
};

// ─── Documents ────────────────────────────────────
export const documents = {
  list: (params) => get(`/documents?${qs(params)}`),
  getExpiring: (params) => get(`/documents/expiring?${qs(params)}`),
};

// ─── Rota ─────────────────────────────────────────
export const rota = {
  weeks: () => get('/rota/weeks'),
  schedule: (params) => get(`/rota/schedule?${qs(params)}`),
  updateShift: (id, data) => patch(`/rota/schedule/${id}`, data),
  bulkUpdate: (schedules) => post('/rota/bulk', { schedules }),
  capacity: (params) => get(`/rota/capacity?${qs(params)}`),
  requestAvailability: (data) => post('/rota/availability/request', data),
  getAvailability: (params) => get(`/rota/availability?${qs(params)}`),
  applyAvailability: (data) => post('/rota/availability/apply', data),
  createTransfer: (data) => post('/rota/transfers', data),
  deleteTransfer: (data) => request('/rota/transfers', { method: 'DELETE', body: JSON.stringify(data) }),
  updateTransferAssignment: (data) => patch('/rota/transfers/assignment', data),
};

// ─── Plans ────────────────────────────────────────
export const planAm = {
  list: (params) => get(`/plans/am?${qs(params)}`),
  createGroup: (data) => post('/plans/am/groups', data),
  updateGroup: (id, data) => patch(`/plans/am/groups/${id}`, data),
  deleteGroup: (id) => del(`/plans/am/groups/${id}`),
  createRow: (data) => post('/plans/am/rows', data),
  updateRow: (id, data) => patch(`/plans/am/rows/${id}`, data),
  deleteRow: (id) => del(`/plans/am/rows/${id}`),
  importPlan: (data) => post('/plans/am/import', data),
  generate: (data) => post('/plans/am/generate', data),
};

export const planPm = {
  list: (params) => get(`/plans/pm?${qs(params)}`),
  createSection: (data) => post('/plans/pm/sections', data),
  updateSection: (id, data) => patch(`/plans/pm/sections/${id}`, data),
  deleteSection: (id) => del(`/plans/pm/sections/${id}`),
  addDriver: (sectionId, data) => post(`/plans/pm/sections/${sectionId}/drivers`, data),
  removeDriver: (sectionId, driverId) => del(`/plans/pm/sections/${sectionId}/drivers/${driverId}`),
  generate: (data) => post('/plans/pm/generate', data),
};

// ─── Vans ─────────────────────────────────────────
export const vans = {
  list: (params) => get(`/vans?${qs(params)}`),
  create: (data) => post('/vans', data),
  update: (id, data) => patch(`/vans/${id}`, data),
  remove: (id) => del(`/vans/${id}`),
  assignments: (params) => get(`/vans/assignments?${qs(params)}`),
  assign: (data) => post('/vans/assignments', data),
  deleteAssignment: (id) => del(`/vans/assignments/${id}`),
};

// ─── Stations ─────────────────────────────────────
export const stations = {
  list: () => get('/stations'),
  create: (data) => post('/stations', data),
  update: (id, data) => patch(`/stations/${id}`, data),
  remove: (id) => del(`/stations/${id}`),
};

// ─── Working Hours ───────────────────────────────
export const workingHours = {
  list: (params) => get(`/working-hours?${qs(params)}`),
  create: (data) => post('/working-hours', data),
  update: (id, data) => patch(`/working-hours/${id}`, data),
  remove: (id) => del(`/working-hours/${id}`),
  importData: (data) => post('/working-hours/import', data),
};

// ─── Change Requests ─────────────────────────────
export const changeRequestsApi = {
  list: (params) => get(`/change-requests?${qs(params)}`),
  update: (id, data) => patch(`/change-requests/${id}`, data),
};

// ─── Auth ─────────────────────────────────────────
export const auth = {
  login: (data) => post('/auth/login', data),
  signup: (data) => post('/auth/signup', data),
  me: () => get('/auth/me'),
};

// ─── Portal Auth ─────────────────────────────────
export const portalAuth = {
  login: (data) => post('/portal/login', data),
  me: () => get('/portal/me'),
};

// ─── Portal Users (Super Admin) ──────────────────
export const portalUsers = {
  list: () => get('/portal/users'),
  create: (data) => post('/portal/users', data),
  update: (id, data) => patch(`/portal/users/${id}`, data),
  remove: (id) => request(`/portal/users/${id}`, { method: 'DELETE' }),
  setPermissions: (id, permissions) => request(`/portal/users/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) }),
  setDepots: (id, depots) => request(`/portal/users/${id}/depots`, { method: 'PUT', body: JSON.stringify({ depots }) }),
};

// ─── Helpers ──────────────────────────────────────
function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  return new URLSearchParams(entries).toString();
}

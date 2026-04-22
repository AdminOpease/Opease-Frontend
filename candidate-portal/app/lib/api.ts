// app/lib/api.ts — API service layer for candidate-portal
import { Platform } from 'react-native';

// In production, set EXPO_PUBLIC_API_BASE (e.g. "https://opease.co.uk/api") at build time.
// The platform-specific defaults are dev-only fallbacks.
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  Platform.select({
    web: 'http://localhost:4000/api',
    android: 'http://10.0.2.2:4000/api',
    default: 'http://localhost:4000/api',
  });

let _token: string | null = null;

// Persist token across page reloads on web
function loadToken(): string | null {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('opease_token');
  }
  return null;
}
_token = loadToken();

export function setToken(t: string | null) {
  _token = t;
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    if (t) localStorage.setItem('opease_token', t);
    else localStorage.removeItem('opease_token');
  }
}
export function getToken() { return _token; }

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (_token) headers.Authorization = `Bearer ${_token}`;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `API ${res.status}`);
  }
  return res.json();
}

function get(path: string) { return request(path); }
function post(path: string, data: unknown) {
  return request(path, { method: 'POST', body: JSON.stringify(data) });
}
function patch(path: string, data: unknown) {
  return request(path, { method: 'PATCH', body: JSON.stringify(data) });
}

// ── Auth ──
export const auth = {
  login: (data: { email: string; password: string }) => post('/auth/login', data),
  me: () => get('/auth/me'),
  updateProfile: (data: Record<string, string>) => patch('/auth/profile', data),
};

// ── Notifications ──
export const notifications = {
  list: (driverId: string) => get(`/notifications?driverId=${driverId}&limit=50`),
  markRead: (id: string) => patch(`/notifications/${id}/read`, {}),
};

// ── Documents ──
export const documents = {
  list: (driverId: string) => get(`/documents?driverId=${driverId}&limit=100`),
  upload: (data: { driver_id: string; type: string; file_name: string }) =>
    post('/documents', data),
};

// ── Applications ──
export const applications = {
  confirmFlex: () => post('/applications/confirm-flex', {}),
  confirmDl: () => post('/applications/confirm-dl', {}),
  bookDrivingTest: (slot: { date: string; time: string }) =>
    post('/applications/book-driving-test', slot),
  bookTraining: (slot: { date: string; time: string }) =>
    post('/applications/book-training', slot),
};

// ── Change Requests ──
export const changeRequests = {
  create: (data: { driver_id: string; section: string; field_name: string; old_value?: string; new_value: string }) =>
    post('/change-requests', data),
};

export const driverActions = {
  submitDvlaCode: (code: string) => post('/auth/submit-dvla-code', { dvla_check_code: code }),
  submitRtwCode: (code: string) => post('/auth/submit-rtw-code', { rtw_share_code_new: code }),
};

export const availability = {
  mine: () => get('/rota/availability/mine'),
  submit: (id: string, data: Record<string, string | null>) => patch(`/rota/availability/${id}`, data),
};

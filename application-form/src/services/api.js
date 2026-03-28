const API_BASE = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const token = localStorage.getItem('opease:token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `API ${res.status}`);
  }
  return res.json();
}

function post(path, data) {
  return request(path, { method: 'POST', body: JSON.stringify(data) });
}

function get(path) {
  return request(path);
}

export const auth = {
  signup: (data) => post('/auth/signup', data),
  verifyEmail: (data) => post('/auth/verify-email', data),
  login: (data) => post('/auth/login', data),
};

export const applications = {
  submit: (data) => post('/applications', data),
};

export const stations = {
  list: () => get('/stations'),
};

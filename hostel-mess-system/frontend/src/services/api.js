const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function withAuthHeaders(headers = {}) {
  const token = localStorage.getItem('adminToken');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const opts = {
    method,
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
      ...(headers || {})
    })
  };

  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE_URL}${path}`, opts);
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  loginAdmin: (payload) => request('/api/auth/admin/login', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' } }),
  getStudents: () => request('/api/students'),
  createStudent: (payload) => request('/api/students', { method: 'POST', body: payload }),
  updateStudent: (id, payload) => request(`/api/students/${id}`, { method: 'PUT', body: payload }),
  deleteStudent: (id) => request(`/api/students/${id}`, { method: 'DELETE' }),

  getMessPlans: () => request('/api/mess-plans'),
  createMessPlan: (payload) => request('/api/mess-plans', { method: 'POST', body: payload }),
  updateMessPlan: (id, payload) => request(`/api/mess-plans/${id}`, { method: 'PUT', body: payload }),
  deleteMessPlan: (id) => request(`/api/mess-plans/${id}`, { method: 'DELETE' }),

  getBilling: () => request('/api/billing'),
  getBillingByStudent: (studentId) => request(`/api/billing/student/${studentId}`),
  createBilling: (payload) => request('/api/billing', { method: 'POST', body: payload }),
  updateBilling: (id, payload) => request(`/api/billing/${id}`, { method: 'PUT', body: payload }),
  deleteBilling: (id) => request(`/api/billing/${id}`, { method: 'DELETE' })
};


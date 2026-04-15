/**
 * API Service Layer - Backend integration helpers
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'mental-pro-token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // no-op
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }
  return data;
}

export const api = {
  // Generic HTTP methods
  async get(path) {
    return request(path, { method: 'GET' });
  },

  async post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
  },

  async put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
  },

  async delete(path) {
    return request(path, { method: 'DELETE' });
  },

  // Auth endpoints
  async login(credentials) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  async register(userData) {
    const data = await request('/auth/register-parent', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  // Parent and child management
  async getChildren(parentId) {
    return request(`/parents/${parentId}/children`);
  },

  async createChild(parentId, payload) {
    return request(`/parents/${parentId}/children`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteChild(parentId, childId) {
    return request(`/parents/${parentId}/children/${childId}`, {
      method: 'DELETE',
    });
  },

  async getParentDashboard(parentId) {
    return request(`/parents/${parentId}/dashboard`);
  },

  // Assessment endpoints
  async submitAssessment(childId, payload) {
    return request(`/children/${childId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAssessments(childId) {
    return request(`/children/${childId}/assessments`);
  },

  // Appointments
  async createAppointment(payload) {
    return request('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getParentAppointments(parentId) {
    return request(`/appointments/parent/${parentId}`);
  },

  async getDoctorAppointments(doctorId = null) {
    const query = doctorId ? `?doctorId=${doctorId}` : '';
    return request(`/appointments/doctor/me${query}`);
  },

  async getDoctorPatients(doctorId = null) {
    const query = doctorId ? `?doctorId=${doctorId}` : '';
    return request(`/appointments/doctor/patients${query}`);
  },

  async updateAppointmentStatus(appointmentId, status, reason = '') {
    return request(`/appointments/${appointmentId}/confirm`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },

  async changeDoctorPassword(currentPassword, newPassword, options = {}) {
    const payload = {
      newPassword,
      ...options,
    };
    if (currentPassword) {
      payload.currentPassword = currentPassword;
    }

    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Alerts
  async getAlerts(parentId) {
    return request(`/alerts?parentId=${parentId}`);
  },

  // Admin analytics
  async getAdminAnalytics() {
    return request('/admin/analytics');
  },
};

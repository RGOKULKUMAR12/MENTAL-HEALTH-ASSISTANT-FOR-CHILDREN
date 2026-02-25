/**
 * API Service Layer - Ready for backend integration
 * Replace mock responses with actual fetch/axios calls when backend is available
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Simulated delay for mock API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Auth endpoints
  async login(credentials) {
    await delay(500);
    // POST ${API_BASE}/auth/login
    return { success: true, user: credentials, token: 'mock-token' };
  },

  async register(userData) {
    await delay(500);
    // POST ${API_BASE}/auth/register
    return { success: true, user: userData };
  },

  // Consent endpoints
  async getConsentRequests(parentId) {
    await delay(300);
    // GET ${API_BASE}/parents/${parentId}/consent-requests
    return [];
  },

  async approveConsent(requestId) {
    await delay(300);
    // POST ${API_BASE}/consent/${requestId}/approve
    return { success: true };
  },

  async rejectConsent(requestId) {
    await delay(300);
    // POST ${API_BASE}/consent/${requestId}/reject
    return { success: true };
  },

  // Assessment endpoints
  async submitAssessment(childId, responses) {
    await delay(500);
    // POST ${API_BASE}/assessments
    return { success: true, assessmentId: 'mock-assessment-id' };
  },

  async getAssessments(childId) {
    await delay(300);
    // GET ${API_BASE}/children/${childId}/assessments
    return [];
  },

  // Wellness tracking
  async getMoodTrend(childId, period) {
    await delay(300);
    // GET ${API_BASE}/children/${childId}/mood-trend?period=${period}
    return [];
  },

  // Alerts
  async getAlerts(userId, role) {
    await delay(300);
    // GET ${API_BASE}/alerts?userId=${userId}&role=${role}
    return [];
  },
};

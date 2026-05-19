// =============================================
//  src/api/client.js — COMPLETE
//  Includes all existing + new admin endpoints
// =============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://neighborhood-backend-production.up.railway.app';

// Helper function — makes API calls with auth token automatically
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = await AsyncStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// Special login just to get token for document upload
export async function loginForUpload(phone, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  const data = await response.json();
  return data.token;
}

// ── Auth ──────────────────────────────────────
export const authAPI = {
  register: (body) => apiCall('/api/auth/register', 'POST', body),
  login:    (body) => apiCall('/api/auth/login',    'POST', body),
  getMe:    ()     => apiCall('/api/auth/me'),
};

// ── Requests ─────────────────────────────────
export const requestAPI = {
  getCategories: ()     => apiCall('/api/requests/categories'),
  create:        (body) => apiCall('/api/requests',    'POST', body),
  getMyRequests: ()     => apiCall('/api/requests/my'),
  getOffered:    ()     => apiCall('/api/requests/offered'),
  accept:        (id)   => apiCall(`/api/requests/${id}/accept`, 'POST'),
  reject:        (id)   => apiCall(`/api/requests/${id}/reject`, 'POST'),
};

// ── Providers ────────────────────────────────
export const providerAPI = {
  getNearby:    (lat, lon) => apiCall(`/api/providers/nearby?lat=${lat}&lon=${lon}`),
  toggleStatus: (body)     => apiCall('/api/providers/toggle-status', 'PATCH', body),
};

// ── Payments ─────────────────────────────────
export const paymentAPI = {
  initiate: (body) => apiCall('/api/payments/initiate', 'POST', body),
  verify:   (body) => apiCall('/api/payments/verify',   'POST', body),
  history:  ()     => apiCall('/api/payments/history'),
};

// ── Reviews ──────────────────────────────────
export const reviewAPI = {
  submit:         (body) => apiCall('/api/reviews',              'POST', body),
  getForProvider: (id)   => apiCall(`/api/reviews/provider/${id}`),
};

// ── Admin ─────────────────────────────────────
export const adminAPI = {
  // Existing
  getStats:       ()    => apiCall('/api/admin/stats'),
  getPending:     ()    => apiCall('/api/admin/providers/pending'),
  verifyProvider: (id)  => apiCall(`/api/admin/providers/${id}/verify`, 'PATCH'),
  suspendUser:    (id)  => apiCall(`/api/admin/users/${id}/suspend`,    'PATCH'),
  reactivateUser: (id)  => apiCall(`/api/admin/users/${id}/reactivate`, 'PATCH'),
  getAllUsers:    ()    => apiCall('/api/admin/users'),

  // NEW methods for AdminDashboardScreen
  getComplaints:   ()    => apiCall('/api/admin/complaints'),
  resolveComplaint: (id) => apiCall(`/api/admin/complaints/${id}/resolve`, 'PUT'),
  getAllReviews:   ()    => apiCall('/api/admin/reviews'),
  deleteReview:    (id)  => apiCall(`/api/admin/reviews/${id}`, 'DELETE'),
  generateReport:  (type) => apiCall(`/api/admin/reports/${type}`),
  getPayments:     ()    => apiCall('/api/admin/payments'),
};
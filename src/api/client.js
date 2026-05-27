// =============================================
//  src/api/client.js — COMPLETE FIXED
//  Fixed: Registration doesn't require token check
//  UPDATED: Better error logging for POST requests
// =============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const BASE_URL = 'https://neighborhood-backend-production.up.railway.app';

// Function to check if token is expired
async function isTokenExpired() {
  const token = await AsyncStorage.getItem('token');
  if (!token) return false; // No token = not expired (for registration/login)
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const expiryTime = payload.exp * 1000;
    const isExpired = Date.now() >= expiryTime;
    
    if (isExpired) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      Alert.alert('Session Expired', 'Your session has expired. Please login again.');
    }
    
    return isExpired;
  } catch (e) {
    return false;
  }
}

// Helper function — makes API calls with auth token automatically
// Added skipTokenCheck parameter for public endpoints (register, login)
async function apiCall(endpoint, method = 'GET', body = null, skipTokenCheck = false) {
  // Skip token expiry check for public endpoints like register, login
  if (!skipTokenCheck && await isTokenExpired()) {
    throw new Error('Session expired. Please login again.');
  }
  
  const token = await AsyncStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    // Handle token expired response from backend
    if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      Alert.alert('Session Expired', 'Please login again to continue.');
      throw new Error('Session expired');
    }
    
    if (!response.ok) {
      // Better error messages from backend
      console.log('API Error Response:', {
        status: response.status,
        message: data.message,
        error: data.error,
        details: data.details
      });
      throw new Error(data.message || data.error || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error(`API Call Failed: ${method} ${endpoint}`, error);
    throw error;
  }
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
// register and login skip token check (public endpoints)
export const authAPI = {
  register: (body) => apiCall('/api/auth/register', 'POST', body, true),
  login:    (body) => apiCall('/api/auth/login',    'POST', body, true),
  getMe:    ()     => apiCall('/api/auth/me'),
  forgotPassword: (body) => apiCall('/api/auth/forgot-password', 'POST', body, true),
  resetPassword:   (body) => apiCall('/api/auth/reset-password',   'POST', body, true),
};

// ── Requests ─────────────────────────────────
// FIXED: Keep snake_case - backend expects category_id, subcategory_id
export const requestAPI = {
  getCategories: ()     => apiCall('/api/requests/categories'),
  create:        (body) => {
    // Backend expects these exact field names (snake_case)
    const requestPayload = {
      category_id: body.category_id,
      subcategory_id: body.subcategory_id,
      description: body.description,
      latitude: body.latitude,
      longitude: body.longitude,
      photo_url: body.photo_url || null
    };
    
    console.log('📤 Sending request payload:', requestPayload);
    return apiCall('/api/requests', 'POST', requestPayload);
  },
  getMyRequests: ()     => apiCall('/api/requests/my'),
  getOffered:    ()     => apiCall('/api/requests/offered'),
  accept:        (id)   => apiCall(`/api/requests/${id}/accept`, 'POST'),
  reject:        (id)   => apiCall(`/api/requests/${id}/reject`, 'POST'),
};

// ── Subcategories ──────────────────────────────
export const subcategoryAPI = {
  getAll:          () => apiCall('/api/subcategories'),
  getByCategory:   (id) => apiCall(`/api/subcategories/category/${id}`),
  getMyServices:   () => apiCall('/api/subcategories/my-services'),
  saveServices:    (subcategory_ids) => apiCall('/api/subcategories/save-services', 'POST', { subcategory_ids }),
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
  getStats:        ()    => apiCall('/api/admin/stats'),
  getPending:      ()    => apiCall('/api/admin/providers/pending'),
  verifyProvider:  (id)  => apiCall(`/api/admin/providers/${id}/verify`, 'PATCH'),
  rejectProvider:  (id)  => apiCall(`/api/admin/providers/${id}/reject`, 'PATCH'),
  getAllUsers:     ()    => apiCall('/api/admin/users'),
  suspendUser:     (id)  => apiCall(`/api/admin/users/${id}/suspend`,    'PATCH'),
  reactivateUser:  (id)  => apiCall(`/api/admin/users/${id}/reactivate`, 'PATCH'),
  getPayments:     ()    => apiCall('/api/admin/payments'),
  generateReport:  (type) => apiCall(`/api/admin/reports/${type}`),
};

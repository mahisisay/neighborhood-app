// =============================================
//  src/context/AuthContext.js
//  Session management with expiry check on app start
//  UPDATED: Added role flags for Seeker/Provider selection
// =============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const AuthContext = createContext(null);
const BASE_URL = 'https://neighborhood-backend-production.up.railway.app';

// Function to check if JWT token is expired
function checkTokenExpiry(jwtToken) {
  try {
    const base64Url = jwtToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const expiryTime = payload.exp * 1000;
    const isExpired = Date.now() >= expiryTime;
    
    if (isExpired) {
      console.log('Token expired at:', new Date(expiryTime));
    }
    
    return isExpired;
  } catch (e) {
    console.log('Token parse error:', e);
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved session on startup with expiry validation
  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        // Check if token is expired
        if (checkTokenExpiry(storedToken)) {
          console.log('Session expired on app start, logging out');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again to continue.'
          );
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.log('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(tokenValue, userData) {
    try {
      await AsyncStorage.setItem('token', tokenValue);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(tokenValue);
      setUser(userData);
      return true;
    } catch (error) {
      console.log('Login storage error:', error);
      return false;
    }
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  }

  // Public method to check current session
  async function checkSession() {
    const currentToken = await AsyncStorage.getItem('token');
    if (currentToken && checkTokenExpiry(currentToken)) {
      await logout();
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again to continue.'
      );
      return false;
    }
    return true;
  }

  // Helper to check if user has provider role
  function hasProviderRole() {
    return user?.hasProviderRole === true || user?.role === 'provider';
  }

  // Helper to check if user has seeker role
  function hasSeekerRole() {
    return user?.hasSeekerRole === true || user?.role === 'seeker';
  }

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, logout, checkSession,
      hasProviderRole, hasSeekerRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
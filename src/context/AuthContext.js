// =============================================
//  src/context/AuthContext.js
//  Session management with expiry check on app start
//  Also checks expiry before API calls
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

  async function switchRole(newRole) {
    if (!user || !token) return false;
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/switch-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const updatedUser = { ...user, active_role: newRole, role: newRole };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Role switch error:', error);
      return false;
    }
  }

  function canSwitchTo(role) {
    if (!user) return false;
    return user.has_both_roles === true || user.has_both_roles === 1;
  }

  function getAvailableRoles() {
    if (!user) return [];
    if (user.has_both_roles || user.has_both_roles === 1) {
      return [
        { role: 'seeker', label: '🔍 Seeker Mode', description: 'Request services' },
        { role: 'provider', label: '👷 Provider Mode', description: 'Offer services' }
      ];
    }
    return [{ role: user.role, label: user.role === 'seeker' ? '🔍 Seeker' : '👷 Provider', description: '' }];
  }

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, logout, checkSession, switchRole, canSwitchTo, getAvailableRoles
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
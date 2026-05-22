// =============================================
//  src/context/AuthContext.js
//  UPDATED: Session expiry check + Role switching
//  Always shows login screen on app open
// =============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const BASE_URL = 'https://neighborhood-backend-production.up.railway.app';

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
        const isExpired = checkTokenExpiry(storedToken);
        
        if (isExpired) {
          // Token expired, clear storage
          console.log('Session expired, logging out');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          setToken(null);
          setUser(null);
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

  // Function to check if JWT token is expired
  function checkTokenExpiry(jwtToken) {
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() >= expiryTime;
    } catch (e) {
      console.log('Token parse error:', e);
      return true; // If can't parse, treat as expired
    }
  }

  async function login(tokenValue, userData) {
    try {
      // Store token and user data
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

  // NEW: Switch between roles (for users with both roles)
  async function switchRole(newRole) {
    if (!user || !token) {
      console.log('No user or token for role switch');
      return false;
    }
    
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
        // Update user with new active role
        const updatedUser = { 
          ...user, 
          active_role: newRole, 
          role: newRole 
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      } else {
        console.log('Role switch failed:', data.message);
        return false;
      }
    } catch (error) {
      console.log('Role switch error:', error);
      return false;
    }
  }

  // Check if user can switch to a specific role
  function canSwitchTo(role) {
    if (!user) return false;
    // User can switch if they have both roles
    return user.has_both_roles === true || user.has_both_roles === 1;
  }

  // Get available roles for switching
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
      user, 
      token, 
      loading, 
      login, 
      logout, 
      switchRole,
      canSwitchTo,
      getAvailableRoles,
      checkTokenExpiry
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
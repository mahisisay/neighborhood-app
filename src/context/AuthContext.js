// =============================================
//  src/context/AuthContext.js
//  UPDATED — Always require login on app open
//  Session clears when app is closed
// =============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(false); // ← false so no auto-login check

  // We do NOT check saved login on startup
  // This means every app open goes to Welcome/Login screen

  async function login(tokenValue, userData) {
    // Save to storage (for API calls during session)
    await AsyncStorage.setItem('token', tokenValue);
    await AsyncStorage.setItem('user',  JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
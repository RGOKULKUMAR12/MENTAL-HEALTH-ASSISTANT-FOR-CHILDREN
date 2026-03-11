/**
 * Auth Context - Handles authentication state and RBAC
 * Parent: email + password | Child: username (User ID) + password (created by parent)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setToken } from '../api/api';

const AuthContext = createContext(null);
const USER_KEY = 'mental-pro-user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => {
    try {
      if (!user) localStorage.removeItem(USER_KEY);
      else localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // no-op
    }
  }, [user]);

  const login = useCallback(async (identifier, password, role) => {
    const data = await api.login({ identifier, password, role });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await api.register({ name, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    return Array.isArray(allowedRoles) ? allowedRoles.includes(user.role) : user.role === allowedRoles;
  }, [user]);

  const value = {
    user,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

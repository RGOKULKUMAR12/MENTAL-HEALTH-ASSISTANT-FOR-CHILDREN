/**
 * Auth Context - Handles authentication state and RBAC
 * Parent: email + password | Child: username (User ID) + password (created by parent)
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((identifier, password, role, findChildByCredentials) => {
    if (role === 'child' && findChildByCredentials) {
      const childUser = findChildByCredentials(identifier, password);
      if (childUser) {
        const userData = {
          id: childUser.id,
          name: childUser.name,
          role: 'child',
          username: childUser.username,
          parentId: childUser.parentId,
          consentStatus: childUser.consentStatus,
        };
        setUser(userData);
        return userData;
      }
      return null;
    }
    if (role === 'parent') {
      const mockUser = MOCK_USERS.parent;
      setUser({ ...mockUser, email: identifier || mockUser.email });
      return { ...mockUser, role: 'parent' };
    }
    if (role === 'admin') {
      const mockUser = MOCK_USERS.admin;
      setUser({ ...mockUser, email: identifier || mockUser.email });
      return { ...mockUser, role: 'admin' };
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    return Array.isArray(allowedRoles) ? allowedRoles.includes(user.role) : user.role === allowedRoles;
  }, [user]);

  const value = {
    user,
    login,
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

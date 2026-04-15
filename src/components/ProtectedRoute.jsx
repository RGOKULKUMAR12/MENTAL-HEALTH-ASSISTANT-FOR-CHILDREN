/**
 * ProtectedRoute - RBAC route guard
 * Redirects to login if not authenticated, or to appropriate dashboard if role mismatch
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to role-appropriate dashboard
    const dashboards = { child: '/dashboard/child', parent: '/dashboard/parent', admin: '/dashboard/admin', doctor: '/dashboard/doctor' };
    return <Navigate to={dashboards[user?.role] || '/dashboard/child'} replace />;
  }

  return children;
}

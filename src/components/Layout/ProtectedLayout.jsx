/**
 * ProtectedLayout - Combines auth check, AppLayout, and Outlet for nested routes
 */

import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import AppLayout from './AppLayout';

export default function ProtectedLayout({ allowedRoles = [] }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  );
}

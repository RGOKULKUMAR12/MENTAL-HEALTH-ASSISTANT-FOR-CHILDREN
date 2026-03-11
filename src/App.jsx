/**
 * Main App - Routes and RBAC configuration
 * Role-based routing: child, parent, admin
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedLayout from './components/Layout/ProtectedLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ChildDashboard from './pages/dashboards/ChildDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import Questionnaire from './pages/Questionnaire';
import Wellness from './pages/Wellness';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import ParentChildren from './pages/ParentChildren';

function App() {
  const { isAuthenticated, user } = useAuth();

  const defaultDashboard = user?.role === 'parent' ? '/dashboard/parent' 
    : user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/child';

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={defaultDashboard} replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={defaultDashboard} replace />} />

      {/* Child routes */}
      <Route element={<ProtectedLayout allowedRoles={['child']} />}>
        <Route path="/dashboard/child" element={<ChildDashboard />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
      </Route>

      {/* Parent routes */}
      <Route element={<ProtectedLayout allowedRoles={['parent']} />}>
        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/dashboard/parent/children" element={<ParentChildren />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>

      {/* Shared routes */}
      <Route element={<ProtectedLayout allowedRoles={['child']} />}>
        <Route path="/wellness" element={<Wellness />} />
      </Route>

      <Route element={<ProtectedLayout allowedRoles={['parent', 'admin']} />}>
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? defaultDashboard : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

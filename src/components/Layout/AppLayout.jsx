/**
 * AppLayout - Main application shell with responsive sidebar navigation
 * Adapts style based on user role (child-friendly vs professional)
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, ClipboardList, Heart, BarChart3, Bell, Settings, LogOut, Menu, X } from 'lucide-react';

const navConfig = {
  child: [
    { to: '/dashboard/child', icon: Home, label: 'My Space' },
    { to: '/questionnaire', icon: ClipboardList, label: 'Check-in' },
    { to: '/wellness', icon: Heart, label: 'Wellness' },
  ],
  parent: [
    { to: '/dashboard/parent', icon: Home, label: 'Dashboard' },
    { to: '/dashboard/parent/children', icon: ClipboardList, label: 'My Children' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard/admin', icon: Home, label: 'Dashboard' },
    { to: '/reports', icon: BarChart3, label: 'Analytics' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
};

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navConfig[user?.role] || navConfig.child;
  const isChild = user?.role === 'child';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar overlay - mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on desktop */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64
        transform transition-transform duration-200 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isChild 
          ? 'bg-gradient-to-b from-soft-mint to-soft-sky' 
          : 'bg-white border-r border-gray-200 shadow-sm'
        }
      `}>
        <div className="flex flex-col h-full">
          <div className={`p-6 ${isChild ? '' : 'border-b border-gray-200'} flex items-center justify-between`}>
            <div>
            <h1 className={`font-display font-bold text-xl ${isChild ? 'text-primary-600' : 'text-gray-800'}`}>
              {isChild ? '🌱 Mindful Kids' : 'Mindful Kids'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? isChild ? 'bg-white/80 text-primary-600 shadow-sm' : 'bg-primary-50 text-primary-600'
                    : isChild ? 'text-gray-700 hover:bg-white/50' : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pt-16 md:pt-6 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

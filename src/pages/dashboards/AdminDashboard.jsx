/**
 * Admin Dashboard - Aggregated anonymized analytics only
 * No individual child data visible
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import AdminUserManagement from '../../components/AdminUserManagement';
import { MOCK_AGGREGATE_ANALYTICS } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Users, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.includes('/users') ? 'users' : 'analytics');

  useEffect(() => {
    setActiveTab(location.pathname.includes('/users') ? 'users' : 'analytics');
  }, [location.pathname]);

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Analytics and user management</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Users & Doctors
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
      <Card className="bg-primary-50 border border-primary-200">
        <p className="text-sm text-gray-700">
          <strong>Privacy note:</strong> This dashboard shows only aggregated statistics. Individual child data is not visible.
        </p>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-soft-mint/50 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total participants</p>
              <p className="text-xl font-bold text-gray-800">163</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-soft-sky/50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assessments this month</p>
              <p className="text-xl font-bold text-gray-800">312</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-soft-lavender/50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active programs</p>
              <p className="text-xl font-bold text-gray-800">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Risk distribution pie chart */}
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Risk level distribution (anonymized)</h2>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_AGGREGATE_ANALYTICS}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {MOCK_AGGREGATE_ANALYTICS.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bar chart */}
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Category breakdown (sample)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_AGGREGATE_ANALYTICS} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={80} />
              <Bar dataKey="count" fill="#ed7620" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex gap-4">
        <Link to="/reports" className="text-primary-600 font-medium hover:underline">View full analytics</Link>
        <Link to="/alerts" className="text-primary-600 font-medium hover:underline">View alerts</Link>
      </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <AdminUserManagement />
      )}
    </div>
  );
}

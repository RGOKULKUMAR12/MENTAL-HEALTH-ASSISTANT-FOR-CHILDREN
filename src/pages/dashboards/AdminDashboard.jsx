/**
 * Admin Dashboard - System overview and analytics only
 * Separate management components for Parents, Doctors, and Analytics
 */

import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Users, FileText, AlertCircle, Check, Clock, Users2, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('mental-pro-token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setAnalytics(null);
        return;
      }
      
      const response = await fetch('http://localhost:4000/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(`Failed to load analytics: ${response.status} ${errorData.error || response.statusText}`);
        setAnalytics(null);
        return;
      }
      
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(`Connection error: ${error.message}`);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and analytics</p>
      </header>

      {/* Statistics Cards */}
      {error && (
        <Card className="bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Error Loading Analytics</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <>
          <Card className="bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">System Overview</p>
                <p className="text-sm text-blue-700 mt-1">
                  Real-time data showing all participants, appointments, and assessments. Use the navigation menu to manage parents, children, and doctors.
                </p>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Children</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.totalParticipants}</p>
                  <p className="text-xs text-gray-500 mt-1">Active participants</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Parent Accounts</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.totalParents}</p>
                  <p className="text-xs text-gray-500 mt-1">Registered guardians</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Users2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doctors</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.totalDoctors}</p>
                  <p className="text-xs text-gray-500 mt-1">Mental health professionals</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assessments</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.assessmentsThisMonth}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Appointments Status */}
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Appointment Status Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600">Awaiting</p>
                <p className="text-xl font-bold text-yellow-700">{analytics.appointmentsByStatus?.booked || 0}</p>
                <Clock className="w-4 h-4 text-yellow-600 mt-2" />
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-xl font-bold text-green-700">{analytics.appointmentsByStatus?.confirmed || 0}</p>
                <Check className="w-4 h-4 text-green-600 mt-2" />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Postponed</p>
                <p className="text-xl font-bold text-blue-700">{analytics.appointmentsByStatus?.postponed || 0}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-red-700">{analytics.appointmentsByStatus?.cancelled || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-700">{analytics.appointmentsByStatus?.rejected || 0}</p>
              </div>
            </div>
          </Card>

          {/* Risk & Disease Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <h2 className="text-lg font-bold text-gray-800 mb-4">🎯 Mental Health Risk Distribution</h2>
              <div className="space-y-3">
                {analytics.riskDistribution?.map((risk) => (
                  <div key={risk.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{risk.category}</span>
                      <span className="text-sm font-bold text-gray-900">{risk.count} children</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(risk.count / Math.max(...analytics.riskDistribution.map(r => r.count), 1)) * 100}%`,
                          backgroundColor: risk.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{risk.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Disease-wise Analysis */}
            <Card>
              <h2 className="text-lg font-bold text-gray-800 mb-4">🏥 Disease-wise Analysis</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {Object.values(analytics.diseaseWiseBreakdown || {}).map((disease) => (
                  <div key={disease.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{disease.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                        {disease.count}
                      </span>
                      <div className="w-12 bg-gray-200 rounded-full h-2 relative">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${disease.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">{disease.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Risk Distribution Pie Chart */}
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Risk Level Breakdown (Visual)</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.riskDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics.riskDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Total Appointments */}
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Total Appointments Booked</h2>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalAppointments}</p>
            <p className="text-sm text-gray-600 mt-2">All appointment statuses combined</p>
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-gray-500">Failed to load analytics data</p>
        </Card>
      )}
    </div>
  );
}

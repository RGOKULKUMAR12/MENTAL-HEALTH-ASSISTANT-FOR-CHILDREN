/**
 * Parent Dashboard - Children results from parent-created accounts
 * Risk-based recommendations, appointment booking for high risk
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChildren } from '../../contexts/ChildrenContext';
import { useAssessment } from '../../contexts/AssessmentContext';
import Card from '../../components/ui/Card';
import RiskBadge from '../../components/ui/RiskBadge';
import AppointmentBookingModal from '../../components/AppointmentBookingModal';
import { MOCK_MOOD_TREND } from '../../data/mockData';
import { RECOMMENDATIONS } from '../../utils/riskAssessment';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Users, Calendar } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { getChildrenByParent, loading } = useChildren();
  const { getAllAssessments } = useAssessment();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const parentId = user?.id;
  const children = getChildrenByParent(parentId);
  const assessments = getAllAssessments();

  const fetchAppointments = async () => {
    if (!parentId) return;
    try {
      setAppointmentsLoading(true);
      const response = await fetch(`http://localhost:4000/api/appointments/parent/${parentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('mental-pro-token') || ''}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [parentId]);

  const appointmentsByChild = useMemo(() => {
    return appointments.reduce((accumulator, appointment) => {
      const key = String(appointment.childId);
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(appointment);
      return accumulator;
    }, {});
  }, [appointments]);

  const hasActiveAppointment = (childId) => {
    const childAppointments = appointmentsByChild[String(childId)] || [];
    return childAppointments.some((appointment) => ['booked', 'confirmed', 'pending', 'postponed'].includes(appointment.status));
  };

  const childrenWithResults = children.map((child) => {
    const assessment = assessments[child.id] || {
      riskLevel: 'low',
      avgScore: null,
      recommendation: RECOMMENDATIONS.low,
      date: null,
    };
    return {
      ...child,
      ...assessment,
      recommendation: assessment.recommendation || RECOMMENDATIONS[assessment.riskLevel || 'low'],
    };
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your children's well-being</p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-soft-sky/50 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Children</p>
              <p className="text-xl font-bold text-gray-800">{loading ? '...' : children.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Children results */}
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> Assessment results & recommendations
        </h2>
        {childrenWithResults.length === 0 ? (
          <p className="text-gray-600 py-4">
            No children yet.{' '}
            <Link to="/dashboard/parent/children" className="text-primary-600 font-medium hover:underline">
              Create a child account
            </Link>
          </p>
        ) : (
          <div className="space-y-6">
            {childrenWithResults.map((child) => {
              const rec = child.recommendation || RECOMMENDATIONS[child.riskLevel || 'low'];
              const showAppointment = rec?.showAppointment && child.riskLevel === 'high' && !hasActiveAppointment(child.id);
              const activeAppointment = hasActiveAppointment(child.id);

              return (
                <div key={child.id} className="p-4 rounded-xl bg-gray-50 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{child.name}</p>
                      <p className="text-sm text-gray-500">
                        Last check-in: {child.date || 'Not yet'}
                        {child.avgScore != null && ` • Score: ${child.avgScore}/5`}
                      </p>
                    </div>
                    <RiskBadge level={child.riskLevel} size="lg" />
                  </div>

                  {child.date && (
                    <div className="pl-4 border-l-4 border-primary-200">
                      <p className="font-medium text-gray-800">{rec?.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{rec?.description}</p>
                      {child.conditions && child.conditions.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                          <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                            ⚠️ Identified Mental Health Areas
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {child.conditions.map((item, idx) => (
                              <div
                                key={idx}
                                className="px-4 py-3 bg-white rounded-lg border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <p className="font-bold text-red-700">{item.condition.name}</p>
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                                    {item.confidence}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{item.condition.description}</p>
                                <p className="text-xs text-gray-700 font-medium mt-2">Key symptoms:</p>
                                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                  {item.condition.symptoms && item.condition.symptoms.slice(0, 2).map((symptom, i) => (
                                    <li key={i}>• {symptom}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rec?.actions && rec.actions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                          {rec.actions.map((action, i) => (
                            <li key={i}>• {action}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {activeAppointment && !showAppointment && (
                    <div className="mt-4 px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                      You already have an active appointment for this child. Booking is available again after the doctor rejects or completes it.
                    </div>
                  )}

                  {showAppointment && (
                    <button
                      onClick={() => {
                        setSelectedChild(child);
                        setBookingOpen(true);
                      }}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Appointment
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <Link to="/dashboard/parent/children" className="block mt-4 text-primary-600 font-medium hover:underline">
          Manage children
        </Link>
      </Card>

      {childrenWithResults.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Weekly mood trend (sample)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MOOD_TREND}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="mood" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Appointment Booking Modal */}
      {selectedChild && (
        <AppointmentBookingModal
          isOpen={bookingOpen}
          onClose={() => {
            setBookingOpen(false);
            setSelectedChild(null);
          }}
          onBooked={fetchAppointments}
          parentId={parentId || ''}
          childId={selectedChild.id || ''}
          childName={selectedChild.name || 'Child'}
        />
      )}
    </div>
  );
}

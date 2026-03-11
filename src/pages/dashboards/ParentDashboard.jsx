/**
 * Parent Dashboard - Children results from parent-created accounts
 * Risk-based recommendations, appointment booking for high risk
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChildren } from '../../contexts/ChildrenContext';
import { useAssessment } from '../../contexts/AssessmentContext';
import Card from '../../components/ui/Card';
import RiskBadge from '../../components/ui/RiskBadge';
import AppointmentBooking from '../../components/AppointmentBooking';
import { MOCK_MOOD_TREND } from '../../data/mockData';
import { RECOMMENDATIONS } from '../../utils/riskAssessment';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { getChildrenByParent, loading } = useChildren();
  const { getAllAssessments } = useAssessment();
  const parentId = user?.id;
  const children = getChildrenByParent(parentId);
  const assessments = getAllAssessments();

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
              const showAppointment = rec?.showAppointment && child.riskLevel === 'high';

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
                      {rec?.actions && rec.actions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                          {rec.actions.map((action, i) => (
                            <li key={i}>• {action}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {showAppointment && <AppointmentBooking childName={child.name} childId={child.id} />}
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
    </div>
  );
}

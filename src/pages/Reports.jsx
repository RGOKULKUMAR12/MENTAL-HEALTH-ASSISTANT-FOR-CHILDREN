/**
 * Reports & Analytics - Parent: child report cards & PDF-ready layout
 * Admin: aggregated anonymized charts only
 */

import { useAuth } from '../contexts/AuthContext';
import { useChildren } from '../contexts/ChildrenContext';
import { useAssessment } from '../contexts/AssessmentContext';
import Card from '../components/ui/Card';
import RiskBadge from '../components/ui/RiskBadge';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, Download, Printer } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const { getChildrenByParent } = useChildren();
  const { getAllAssessments } = useAssessment();
  const isAdmin = user?.role === 'admin';
  const children = getChildrenByParent(user?.id);
  const assessments = getAllAssessments();
  const childrenWithResults = children.map((child) => {
    const assessment = assessments[child.id] || null;
    return {
      ...child,
      riskLevel: assessment?.riskLevel || 'low',
      avgScore: assessment?.avgScore ?? null,
      date: assessment?.date || null,
    };
  });
  const assessedChildren = childrenWithResults.filter((child) => child.date);
  const averageScore = assessedChildren.length
    ? assessedChildren.reduce((sum, child) => sum + (Number(child.avgScore) || 0), 0) / assessedChildren.length
    : 0;
  const riskData = [
    { key: 'low', label: 'Low', count: assessedChildren.filter((child) => child.riskLevel === 'low').length, color: '#22c55e' },
    { key: 'moderate', label: 'Moderate', count: assessedChildren.filter((child) => child.riskLevel === 'moderate').length, color: '#f59e0b' },
    { key: 'high', label: 'High', count: assessedChildren.filter((child) => child.riskLevel === 'high').length, color: '#ef4444' },
  ].filter((item) => item.count > 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Placeholder - would generate PDF via backend
    alert('PDF report download would be generated here. Connect to backend API.');
  };

  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-6xl">
        <header className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Aggregated, anonymized data only. No individual identifiers.</p>
          </div>
        </header>

        <Card className="bg-primary-50 border border-primary-200 print:hidden">
          <p className="text-sm text-gray-700">
            <strong>Privacy:</strong> Individual child data is not visible. Only aggregated statistics.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Risk level distribution (anonymized)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MOCK_AGGREGATE_ANALYTICS} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {MOCK_AGGREGATE_ANALYTICS.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Category breakdown</h2>
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
      </div>
    );
  }

  // Parent view - child report summary
  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600 mt-1">Summary of well-being trends</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 text-primary-500" />
            <div>
              <p className="text-sm text-gray-500">Average assessment score</p>
              <p className="text-xl font-bold text-gray-800">
                {assessedChildren.length ? `${averageScore.toFixed(1)}/5` : 'No data'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <RiskBadge level={assessedChildren.find((child) => child.riskLevel === 'high') ? 'high' : assessedChildren.find((child) => child.riskLevel === 'moderate') ? 'moderate' : 'low'} />
            <p className="text-sm text-gray-500">Current highest risk level</p>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 text-primary-500" />
            <div>
              <p className="text-sm text-gray-500">Assessments saved</p>
              <p className="text-xl font-bold text-gray-800">{assessedChildren.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Risk distribution across children</h2>
        {riskData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                  {riskData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No assessment data yet.</p>
        )}
      </Card>

      <p className="text-sm text-gray-500">
        This report is for monitoring and support only. It is not a medical diagnosis.
      </p>
    </div>
  );
}

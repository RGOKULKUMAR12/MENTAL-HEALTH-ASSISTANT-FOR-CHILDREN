/**
 * Alerts & Notifications - Non-alarming, informational
 * Color-coded: yellow/orange/red for risk increase
 * Explains "risk increase detected" without diagnosis
 */

import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import { MOCK_ALERTS } from '../data/mockData';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';

const severityStyles = {
  low: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: Info,
    iconColor: 'text-yellow-600',
  },
  moderate: {
    bg: 'bg-orange-50 border-orange-200',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
  },
  high: {
    bg: 'bg-red-50 border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
};

export default function Alerts() {
  const { user } = useAuth();
  const alerts = MOCK_ALERTS;

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Alerts & reminders</h1>
        <p className="text-gray-600 mt-1">
          Informational updates only. Not medical diagnoses—just helpful check-ins.
        </p>
      </header>

      <Card className="bg-primary-50 border border-primary-200">
        <p className="text-sm text-gray-700">
          <strong>What these alerts mean:</strong> When patterns change, we may suggest checking in.
          This is supportive, not diagnostic. No medical claims are made.
        </p>
      </Card>

      {alerts.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">No new alerts. Keep checking in regularly!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const style = severityStyles[alert.severity] || severityStyles.low;
            const Icon = style.icon;
            return (
              <Card
                key={alert.id}
                className={`${style.bg} border-l-4 ${
                  alert.severity === 'low' ? 'border-l-yellow-400' : alert.severity === 'moderate' ? 'border-l-orange-400' : 'border-l-red-400'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}>
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Risk increase detected (informational)
                    </p>
                    <p className="text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-2">{alert.date}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      This is not a diagnosis. Consider checking in with your child or counselor as needed.
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

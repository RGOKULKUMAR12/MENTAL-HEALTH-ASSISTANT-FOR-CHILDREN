/**
 * Settings & Consent Management
 * Parent/admin: manage consent, notifications
 * Child: limited settings
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { User, Bell, Shield, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const isChild = user?.role === 'child';

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </header>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Role: {user?.role}</p>
          </div>
        </div>
      </Card>

      {/* Consent management - parents and admins */}
      {!isChild && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Consent management
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage parent consent for child participation. Children cannot submit assessments without approval.
          </p>
          <Link
            to="/dashboard/parent/children"
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-medium text-gray-800">Manage linked children & consent</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Weekly digest</span>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>
        </div>
      </Card>

      {/* Privacy note */}
      <Card className="bg-gray-50">
        <p className="text-sm text-gray-600">
          <strong>Privacy:</strong> Your data is stored securely. We do not sell or share personal information.
          This tool is for monitoring and support—not medical diagnosis.
        </p>
      </Card>
    </div>
  );
}

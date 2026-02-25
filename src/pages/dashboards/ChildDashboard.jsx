/**
 * Child Dashboard - Simple welcome and quick actions
 * Check-in and Wellness only
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardList, Heart } from 'lucide-react';

export default function ChildDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-600">
          Hi, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">How are you feeling today?</p>
      </header>

      {/* Quick actions - Check-in and Wellness only */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/questionnaire"
          className="flex flex-col items-center justify-center p-8 rounded-2xl bg-soft-mint/50 hover:bg-soft-mint transition-colors"
        >
          <ClipboardList className="w-12 h-12 text-primary-600 mb-3" />
          <span className="font-medium text-gray-800 text-lg">Check-in</span>
          <span className="text-sm text-gray-500 mt-1">Share how you feel</span>
        </Link>
        <Link
          to="/wellness"
          className="flex flex-col items-center justify-center p-8 rounded-2xl bg-soft-lavender/50 hover:bg-soft-lavender transition-colors"
        >
          <Heart className="w-12 h-12 text-primary-600 mb-3" />
          <span className="font-medium text-gray-800 text-lg">Wellness</span>
          <span className="text-sm text-gray-500 mt-1">Breathing & mindfulness</span>
        </Link>
      </div>
    </div>
  );
}

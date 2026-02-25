/**
 * Appointment Booking - For high-risk children
 * UI-only form; backend will handle booking
 */

import { useState } from 'react';
import Card from '../components/ui/Card';
import { Calendar, Clock, User } from 'lucide-react';

export default function AppointmentBooking({ childName, childId }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // API: POST /appointments
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="bg-risk-low/20 border-l-4 border-risk-low">
        <p className="font-semibold text-gray-800">Request submitted</p>
        <p className="text-sm text-gray-600 mt-1">
          A counselor will contact you to confirm the appointment. This is for support only—not a diagnosis.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-600" /> Book appointment with child psychiatrist / counselor for {childName}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Based on the assessment, we recommend scheduling an appointment with a child psychiatrist or mental health counselor for additional support.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select time</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brief note (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Any specific concerns to discuss?"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
        >
          Submit request
        </button>
      </form>
    </Card>
  );
}

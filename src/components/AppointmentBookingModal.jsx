/**
 * Improved Appointment Booking Modal
 * Shows doctors, available time slots, and books appointments with email notification
 */

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle, MapPin } from 'lucide-react';
import { api } from '../api/api';

export default function AppointmentBookingModal({ isOpen, onClose, onBooked, parentId, childId, childName }) {
  const [stage, setStage] = useState('doctors'); // 'doctors' | 'slots' | 'confirm' | 'success'
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [shareDataConsent, setShareDataConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);

  // Fetch doctors
  useEffect(() => {
    if (isOpen && stage === 'doctors') {
      fetchDoctors();
    }
  }, [isOpen, stage]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctors');
      // api.get returns raw JSON, but some responses could be wrapped
      const doctorList =
        Array.isArray(response) ? response :
        Array.isArray(response?.data) ? response.data :
        Array.isArray(response?.doctors) ? response.doctors :
        [];
      setDoctors(doctorList);
      setError('');
    } catch (err) {
      setError(`Failed to load doctors. Please try again. (${err?.message || 'unknown'})`);
      console.error('AppointmentBookingModal.fetchDoctors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    try {
      setLoading(true);
      const response = await api.get(`/doctors/${doctor.id}/slots`);
      // backend returns {doctor, slots}
      setSlots(response.slots || []);
      setStage('slots');
      setError('');
    } catch (err) {
      setError('Failed to load available slots.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setStage('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!reason.trim()) {
      setError('Please describe the reason for appointment');
      return;
    }

    if (!shareDataConsent) {
      setError('Please allow sharing the child assessment data with the doctor.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/appointments/book', {
        parentId,
        childId,
        doctorId: selectedDoctor.id,
        timeSlotId: selectedSlot.id,
        reason,
        shareDataConsent,
      });

      setAppointmentId(response.id || response.data?.id);
      setStage('success');
      setError('');
      if (onBooked) onBooked();
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Book an Appointment</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* DOCTORS SELECTION STAGE */}
          {stage === 'doctors' && (
            <div className="space-y-4">
              <p className="text-gray-600">Select a mental health professional to consult with.</p>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin">⏳</div>
                  <p className="text-gray-600 mt-2">Loading doctors...</p>
                </div>
              ) : doctors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleSelectDoctor(doctor)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
                          <p className="text-sm text-primary-600 font-medium">{doctor.specialization}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5" />
                              <span>{doctor.clinicAddress || doctor.clinic_address || 'Clinic address not provided'}</span>
                            </p>
                          {doctor.bio && <p className="text-sm text-gray-600 mt-2">{doctor.bio}</p>}
                          <p className="text-xs text-gray-500 mt-2">
                            {doctor.available_slots} available slots
                          </p>
                        </div>
                        <div className="text-2xl">👨‍⚕️</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No doctors available at the moment.</p>
              )}
            </div>
          )}

          {/* SLOTS SELECTION STAGE */}
          {stage === 'slots' && selectedDoctor && (
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <p className="text-sm text-gray-600 mb-1">Selected Doctor</p>
                <h3 className="font-semibold text-lg text-primary-700">{selectedDoctor.name}</h3>
                <p className="text-sm text-primary-600">{selectedDoctor.specialization}</p>
              </div>

              <p className="text-gray-600">Choose an available time slot.</p>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin">⏳</div>
                  <p className="text-gray-600 mt-2">Loading time slots...</p>
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                  {slots.map((slot) => {
                    const slotDate = new Date(slot.date);
                    const dayName = slotDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateStr = slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all flex items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            <span className="font-medium text-gray-800">
                              {dayName}, {dateStr}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <Clock className="w-4 h-4 text-primary-500" />
                            <span className="text-gray-700">{slot.time}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No available slots at the moment.</p>
              )}

              <button
                onClick={() => setStage('doctors')}
                className="w-full text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                ← Change Doctor
              </button>
            </div>
          )}

          {/* CONFIRM STAGE */}
          {stage === 'confirm' && selectedDoctor && selectedSlot && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                <h3 className="font-semibold text-gray-800">Appointment Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Child</p>
                      <p className="font-medium text-gray-800">{childName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Doctor</p>
                      <p className="font-medium text-gray-800">{selectedDoctor.name}</p>
                      <p className="text-xs text-primary-600">{selectedDoctor.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        <span>{selectedDoctor.clinicAddress || selectedDoctor.clinic_address || 'Clinic address not provided'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        at {selectedSlot.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Reason for Visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe why you're seeking this appointment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 default"
                  rows={4}
                />
              </div>

              <label className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareDataConsent}
                  onChange={(e) => setShareDataConsent(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to share the child's assessment history and relevant data with the selected doctor for this appointment.
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStage('slots')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STAGE */}
          {stage === 'success' && appointmentId && (
            <div className="text-center space-y-4 py-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-600">Appointment Request Sent!</h3>
              <p className="text-gray-600">
                Your request with <strong>{selectedDoctor.name}</strong> has been sent for doctor approval.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-left space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong>{' '}
                  {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Time:</strong> {selectedSlot.time}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Confirmation ID:</strong> #{appointmentId}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to the doctor. They will contact you to confirm the appointment.
              </p>
              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Dashboard for Managing Doctors and Time Slots
 */

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Mail, Phone, User, Clock, X } from 'lucide-react';
import { api } from '../api/api';

export default function DoctorManagementAdmin() {
  const [doctors, setDoctors] = useState([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [slotForm, setSlotForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    durationMinutes: 30,
  });

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctors');
      setDoctors(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.name || !doctorForm.specialization || !doctorForm.email) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/doctors', doctorForm);
      setDoctorForm({ name: '', specialization: '', email: '', phone: '', bio: '' });
      setShowAddDoctor(false);
      fetchDoctors();
      setError('');
    } catch (err) {
      setError('Failed to add doctor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Delete this doctor?')) {
      try {
        setLoading(true);
        await api.delete(`/doctors/${doctorId}`);
        fetchDoctors();
        setError('');
      } catch (err) {
        setError('Failed to delete doctor');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.doctorId || !slotForm.date || !slotForm.time) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/slots', slotForm);
      setSlotForm({ doctorId: '', date: '', time: '', durationMinutes: 30 });
      setShowAddSlot(false);
      fetchDoctors();
      setError('');
    } catch (err) {
      setError('Failed to add time slot: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="font-display text-3xl font-bold text-primary-600 mb-2">Doctor Management</h1>
        <p className="text-gray-600">Manage doctors and their available time slots</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex justify-between items-center">
          {error}
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Doctors Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-display text-2xl font-bold text-gray-800">Doctors</h2>
          <button
            onClick={() => setShowAddDoctor(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Doctor
          </button>
        </div>

        {/* Doctors List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-500" />
                      <span className="font-medium text-gray-800">{doctor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doctor.specialization}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {doctor.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {doctor.phone || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        title="Manage slots"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete doctor"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Add Doctor</h2>
              <button onClick={() => setShowAddDoctor(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  placeholder="e.g., Child Psychologist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  placeholder="Brief professional biography"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Doctor Slots Section */}
      {selectedDoctor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b bg-blue-50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">{selectedDoctor.name}</h2>
                <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">Available Time Slots</h3>
            <button
              onClick={() => {
                setSlotForm({ ...slotForm, doctorId: selectedDoctor.id });
                setShowAddSlot(true);
              }}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Slot
            </button>
          </div>

          {/* Time Slots List */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Time slots for this doctor are managed from the backend. Use the form above to add new slots.
            </p>
          </div>
        </div>
      )}

      {/* Add Time Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Add Time Slot</h2>
              <button onClick={() => setShowAddSlot(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select
                  value={slotForm.doctorId}
                  onChange={(e) => setSlotForm({ ...slotForm, doctorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="time"
                  value={slotForm.time}
                  onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={slotForm.durationMinutes}
                  onChange={(e) => setSlotForm({ ...slotForm, durationMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

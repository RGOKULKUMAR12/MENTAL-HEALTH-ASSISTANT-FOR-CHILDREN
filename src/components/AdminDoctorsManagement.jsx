import { useState, useEffect } from 'react';
import Card from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../api/api';
import { Stethoscope, Phone, Mail, Briefcase, Calendar, Clock, Trash2, Plus, ChevronDown, ChevronUp, User, X } from 'lucide-react';

export default function AdminDoctorsManagement() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedDoctorForSlot, setSelectedDoctorForSlot] = useState(null);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlotForm, setNewSlotForm] = useState({ date: '', time: '09:00', duration: '30' });
  const { logout } = useAuth();

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      alert('Session expired or unauthorized. Please log in again.');
      logout();
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        logout();
        window.location.href = '/login';
        return;
      }

      // Fetch doctors
      const doctorsRes = await fetch('http://localhost:4000/api/doctors', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (handleAuthError(doctorsRes.status)) return;
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      }

      // Fetch appointments
      const appointmentsRes = await fetch('http://localhost:4000/api/appointments/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (handleAuthError(appointmentsRes.status)) return;
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.items || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    if (!newSlotForm.date || !newSlotForm.time) {
      alert('Please select date and time');
      return;
    }

    const duplicate = timeSlots.some(
      (slot) => slot.date === newSlotForm.date && slot.time === newSlotForm.time
    );
    if (duplicate) {
      alert('This time slot already exists. Choose another time.');
      return;
    }

    const sameDateSlots = timeSlots
      .filter((slot) => slot.date === newSlotForm.date)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (sameDateSlots.length > 0) {
      const last = sameDateSlots[sameDateSlots.length - 1];
      const [h, m] = last.time.split(':').map(Number);
      const duration = Number(last.duration);
      const endMinutes = h * 60 + m + duration;
      const endHour = String(Math.floor(endMinutes / 60)).padStart(2, '0');
      const endMin = String(endMinutes % 60).padStart(2, '0');
      const recommended = `${endHour}:${endMin}`;

      if (newSlotForm.time !== recommended) {
        if (!window.confirm(
          `The last slot ends at ${recommended}. Do you still want to add at ${newSlotForm.time}?`
        )) {
          return;
        }
      }
    }

    setTimeSlots([...timeSlots, { ...newSlotForm }]);

    let nextTime = '09:00';
    if (sameDateSlots.length > 0) {
      const last = sameDateSlots[sameDateSlots.length - 1];
      const [lastH, lastM] = last.time.split(':').map(Number);
      const lastDuration = Number(last.duration);
      const endMinutes = lastH * 60 + lastM + lastDuration;
      const endHour = String(Math.floor(endMinutes / 60)).padStart(2, '0');
      const endMin = String(endMinutes % 60).padStart(2, '0');
      nextTime = `${endHour}:${endMin}`;
    }

    setNewSlotForm({ date: newSlotForm.date, time: nextTime, duration: newSlotForm.duration });
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctorForm.name || !newDoctorForm.specialization || !newDoctorForm.email || !newDoctorForm.phone) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('http://localhost:4000/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newDoctorForm),
      });

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        const err = await response.json();
        alert(`Error: ${err.error || err.message}`);
        return;
      }

      const doctorData = await response.json();
      const doctorId = doctorData.id;

      if (!doctorId) {
        alert('Error: Invalid response from server');
        return;
      }

      // Create time slots
      if (timeSlots.length > 0) {
        for (const slot of timeSlots) {
          try {
            const slotRes = await fetch('http://localhost:4000/api/slots', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                doctorId,
                date: slot.date,
                time: slot.time,
                durationMinutes: parseInt(slot.duration),
              }),
            });
          } catch (error) {
            console.error('Error creating slot:', error);
          }
        }
      }

      alert('Doctor created successfully! A temporary password was emailed to the doctor.');
      setNewDoctorForm({ name: '', specialization: '', email: '', phone: '', bio: '' });
      setTimeSlots([]);
      setShowAddDoctorModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert(`Failed to create doctor: ${error.message}`);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotForm.date || !newSlotForm.time) {
      alert('Please select date and time');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('http://localhost:4000/api/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctorForSlot.id,
          date: newSlotForm.date,
          time: newSlotForm.time,
          durationMinutes: parseInt(newSlotForm.duration),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add slot');
      }

      alert('Time slot added successfully!');
      setNewSlotForm({ date: '', time: '09:00', duration: '30' });
      setShowAddSlotModal(false);
      setSelectedDoctorForSlot(null);
      fetchData();
    } catch (error) {
      console.error('Error adding slot:', error);
      alert(`Failed to add slot: ${error.message}`);
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (window.confirm('⚠️ Are you sure you want to delete this doctor?')) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:4000/api/doctors/${doctorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (handleAuthError(response.status)) return;

        if (response.ok) {
          alert('✓ Doctor deleted successfully');
          fetchData();
        } else {
          alert('Failed to delete doctor');
        }
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const isAppointmentExpired = (date, time) => {
    if (!date || !time) return false;
    
    try {
      const appointmentDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      return appointmentDateTime < now;
    } catch (e) {
      return false;
    }
  };

  const getAppointmentStatus = (appointment) => {
    // If appointment time has passed and status is not already terminal, mark as expired
    if (isAppointmentExpired(appointment.appointmentDate, appointment.appointmentTime)) {
      if (!['cancelled', 'rejected'].includes(appointment.status)) {
        return 'expired';
      }
    }
    return appointment.status;
  };

  const getStatusColor = (status) => {
    const colors = {
      booked: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-gray-100 text-gray-800',
      expired: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2">
              <h3 className="text-lg font-bold text-gray-800">Add New Doctor</h3>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newDoctorForm.name}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                  placeholder="Dr. Jane Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  value={newDoctorForm.specialization}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
                  placeholder="Child Psychiatrist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newDoctorForm.email}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                  placeholder="doctor@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={newDoctorForm.phone}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                <textarea
                  value={newDoctorForm.bio}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, bio: e.target.value })}
                  placeholder="Brief bio (optional)"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Time Slots Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Available Time Slots</h4>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={newSlotForm.date}
                      onChange={(e) => setNewSlotForm({ ...newSlotForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={newSlotForm.time}
                        onChange={(e) => setNewSlotForm({ ...newSlotForm, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                      <select
                        value={newSlotForm.duration}
                        onChange={(e) => setNewSlotForm({ ...newSlotForm, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min</option>
                        <option value="90">90 min</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                  >
                    + Add Time Slot
                  </button>
                </div>

                {timeSlots.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Added Slots ({timeSlots.length})</p>
                    <div className="space-y-2">
                      {timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                          <span className="text-sm text-gray-700">
                            {new Date(slot.date).toLocaleDateString()} • {slot.time} ({slot.duration} min)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddSlotModal && selectedDoctorForSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Add Time Slot for {selectedDoctorForSlot.name}</h3>
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newSlotForm.date}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newSlotForm.time}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <select
                  value={newSlotForm.duration}
                  onChange={(e) => setNewSlotForm({ ...newSlotForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Card>
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'doctors'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            👨‍⚕️ Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'appointments'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📅 Appointments ({appointments.length})
          </button>
        </div>
      </Card>

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Doctors ({doctors.length})</h2>
            </div>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No doctors registered</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{doctor.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Briefcase className="w-4 h-4" />
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    {doctor.available && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex-shrink-0">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{doctor.phone}</span>
                    </div>
                  </div>

                  {doctor.bio && <p className="text-sm text-gray-600 mb-4">{doctor.bio}</p>}

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedDoctorForSlot(doctor);
                        setShowAddSlotModal(true);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Time Slot
                    </button>

                    <button
                      onClick={() => deleteDoctor(doctor.id)}
                      className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Doctor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            All Appointments
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">#{apt.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{apt.childName}</p>
                          <p className="text-xs text-gray-600">by {apt.parentName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{apt.doctorName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span>{apt.appointmentDate} {apt.appointmentTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const displayStatus = getAppointmentStatus(apt);
                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
                              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{apt.reason || 'Not specified'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

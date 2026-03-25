import { useState, useEffect } from 'react';
import Card from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../api/api';
import { Users, Stethoscope, Baby, Mail, Phone, Briefcase, Calendar, Trash2, Plus } from 'lucide-react';

export default function AdminUserManagement() {
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
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

  const [newParentForm, setNewParentForm] = useState({ name: '', email: '', password: '' });
  const [newDoctorForm, setNewDoctorForm] = useState({ name: '', specialization: '', email: '', phone: '', bio: '' });
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlotForm, setNewSlotForm] = useState({ date: '', time: '09:00', duration: '30' });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        logout();
        window.location.href = '/login';
        return;
      }
      
      // Fetch parents
      const parentsRes = await fetch('http://localhost:4000/api/auth/users?role=parent', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (handleAuthError(parentsRes.status)) return;
      if (parentsRes.ok) {
        const parentsData = await parentsRes.json();
        setParents(parentsData);
      }

      // Fetch children
      const childrenRes = await fetch('http://localhost:4000/api/auth/users?role=child', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (handleAuthError(childrenRes.status)) return;
      if (childrenRes.ok) {
        const childrenData = await childrenRes.json();
        setChildren(childrenData);
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
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParent = async (e) => {
    e.preventDefault();
    if (!newParentForm.name || !newParentForm.email || !newParentForm.password) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('http://localhost:4000/api/auth/admin/create-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newParentForm),
      });

      if (handleAuthError(response.status)) return;

      if (response.ok) {
        alert('Parent created successfully!');
        setNewParentForm({ name: '', email: '', password: '' });
        setShowAddParentModal(false);
        fetchAllUsers();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error('Error creating parent:', error);
      alert('Failed to create parent');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/auth/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          alert('User deleted successfully');
          fetchAllUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:4000/api/doctors/${doctorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setDoctors(doctors.filter((d) => d.id !== doctorId));
          alert('Doctor deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const addTimeSlot = () => {
    if (!newSlotForm.date || !newSlotForm.time) {
      alert('Please select date and time');
      return;
    }

    // Prevent adding duplicate slot for same date/time
    const duplicate = timeSlots.some(
      (slot) => slot.date === newSlotForm.date && slot.time === newSlotForm.time
    );
    if (duplicate) {
      alert('This time slot already exists in the list. Choose another time.');
      return;
    }

    // Optional sequential enforcement: if there is prior slot on same date, next should start at prior end
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

    // Set next start time automatically for same date
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
        body: JSON.stringify({
          ...newDoctorForm,
        }),
      });

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        const err = await response.json();
        const errMessage = err.error || err.message || 'Unknown error';
        alert(`Error creating doctor: ${errMessage}`);
        return;
      }

      const doctorData = await response.json();
      const doctorId = doctorData.id; // server returns created doctor object here
      if (!doctorId) {
        alert('Error creating doctor: invalid response from server (missing id)');
        return;
      }

      // Create time slots if any are defined
      if (timeSlots.length > 0 && doctorId) {
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

            if (!slotRes.ok) {
              console.error('Error creating slot for', slot);
            }
          } catch (slotError) {
            console.error('Error creating time slot:', slotError);
          }
        }
      }

      alert('Doctor created successfully!' + (timeSlots.length > 0 ? ` (${timeSlots.length} time slots added)` : ''));
      setNewDoctorForm({ name: '', specialization: '', email: '', phone: '', bio: '' });
      setTimeSlots([]);
      setShowAddDoctorModal(false);
      fetchAllUsers();
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert(`Failed to create doctor: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Parent Modal */}
      {showAddParentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Create New Parent Account</h3>
              <button
                onClick={() => setShowAddParentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddParent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newParentForm.name}
                  onChange={(e) => setNewParentForm({ ...newParentForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newParentForm.email}
                  onChange={(e) => setNewParentForm({ ...newParentForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newParentForm.password}
                  onChange={(e) => setNewParentForm({ ...newParentForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddParentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Parent
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

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

                {/* Time Slots List */}
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

      {/* Parents Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Parents ({parents.length})</h2>
          </div>
          <button
            onClick={() => setShowAddParentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Parent
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 py-4">Loading...</p>
        ) : parents.length === 0 ? (
          <p className="text-gray-500 py-4">No parents registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Created</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((parent) => (
                  <tr key={parent.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{parent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{parent.email}</td>
                    <td className="py-3 px-4 text-gray-600">{parent.created_at ? new Date(parent.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteUser(parent.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Children Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Baby className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Children ({children.length})</h2>
        </div>

        {children.length === 0 ? (
          <p className="text-gray-500 py-4">No children registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Username</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Created</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Baby className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-800">{child.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{child.username}</td>
                    <td className="py-3 px-4 text-gray-600">{child.createdAt || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Doctors Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
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

        {doctors.length === 0 ? (
          <p className="text-gray-500 py-4">No doctors registered</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Available
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                </div>

                {doctor.bio && (
                  <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded italic">
                    "{doctor.bio}"
                  </div>
                )}

                <button
                  onClick={() => deleteDoctor(doctor.id)}
                  className="w-full mt-3 px-3 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Doctor
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/api';
import Card from '../../components/ui/Card';
import { Calendar, CheckCircle2, XCircle, Users, FileText, Clock, ShieldCheck, Filter, ArrowRight, Lock, ChevronDown, ChevronUp } from 'lucide-react';

function isFutureAppointment(appointment) {
  if (!appointment?.appointmentDate || !appointment?.appointmentTime) return false;
  const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
  return appointmentDateTime >= new Date();
}

function statusColor(status) {
  switch (status) {
    case 'booked':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'postponed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function DoctorDashboard() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [forceCurrentPassword, setForceCurrentPassword] = useState('');
  const [forceNewPassword, setForceNewPassword] = useState('');
  const [forcePasswordError, setForcePasswordError] = useState('');
  const [forcePasswordLoading, setForcePasswordLoading] = useState(false);

  const appointmentIdFromLink = searchParams.get('appointmentId');
  const actionFromLink = searchParams.get('action');

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, patientsRes] = await Promise.all([
        api.getDoctorAppointments(),
        api.getDoctorPatients(),
      ]);
      setAppointments(appointmentsRes.items || []);
      setPatients(patientsRes.items || []);
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  useEffect(() => {
    setShowForcePasswordModal(user?.role === 'doctor' && user?.mustChangePassword === true);
  }, [user?.role, user?.mustChangePassword]);

  useEffect(() => {
    const runLinkAction = async () => {
      if (!appointmentIdFromLink || !actionFromLink) return;
      if (!['confirmed', 'rejected', 'postponed', 'completed'].includes(actionFromLink)) return;

      try {
        setActionLoading(true);
        await api.updateAppointmentStatus(appointmentIdFromLink, actionFromLink, 'Processed via email link');
        await fetchDoctorData();
        searchParams.delete('appointmentId');
        searchParams.delete('action');
        setSearchParams(searchParams, { replace: true });
      } catch (err) {
        setError(err?.message || 'Unable to process appointment action');
      } finally {
        setActionLoading(false);
      }
    };

    runLinkAction();
  }, [appointmentIdFromLink, actionFromLink]);

  const pendingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'booked'),
    [appointments],
  );

  const futureAppointments = useMemo(
    () => appointments.filter((appointment) => isFutureAppointment(appointment)),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (appointmentFilter === 'future' && !isFutureAppointment(appointment)) return false;
      if (appointmentFilter === 'pending' && appointment.status !== 'booked') return false;
      if (appointmentFilter === 'completed' && appointment.status !== 'completed') return false;
      if (appointmentFilter === 'confirmed' && appointment.status !== 'confirmed') return false;
      return true;
    });
  }, [appointments, appointmentFilter]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const latestAssessment = patient.assessments?.[0];
      if (riskFilter === 'all') return true;
      if (!latestAssessment) return false;
      return latestAssessment.riskLevel === riskFilter;
    });
  }, [patients, riskFilter]);

  const handleAppointmentAction = async (appointmentId, status) => {
    try {
      setActionLoading(true);
      await api.updateAppointmentStatus(appointmentId, status, `Doctor marked as ${status}`);
      await fetchDoctorData();
    } catch (err) {
      setError(err?.message || 'Unable to update appointment status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      await api.changeDoctorPassword(currentPassword, newPassword);
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage(err?.message || 'Failed to update password');
    }
  };

  const handleForcedPasswordChange = async (e) => {
    e.preventDefault();
    setForcePasswordError('');
    setForcePasswordLoading(true);

    try {
      await api.changeDoctorPassword(forceCurrentPassword, forceNewPassword);
      updateUser({ mustChangePassword: false });
      setShowForcePasswordModal(false);
      setForceCurrentPassword('');
      setForceNewPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (err) {
      setForcePasswordError(err?.message || 'Failed to update password');
    } finally {
      setForcePasswordLoading(false);
    }
  };

  return (
    <div className="relative">
      {showForcePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">Change Temporary Password</h2>
            <p className="text-sm text-gray-600 mt-2">
              For security, you must update your temporary password before continuing.
            </p>

            <form onSubmit={handleForcedPasswordChange} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password</label>
                <input
                  type="password"
                  value={forceCurrentPassword}
                  onChange={(e) => setForceCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={forceNewPassword}
                  onChange={(e) => setForceNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  minLength={6}
                  required
                />
              </div>

              {forcePasswordError && <p className="text-sm text-red-600">{forcePasswordError}</p>}

              <button
                type="submit"
                disabled={forcePasswordLoading}
                className="w-full px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {forcePasswordLoading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`space-y-6 max-w-7xl ${showForcePasswordModal ? 'pointer-events-none select-none blur-[1px]' : ''}`}>
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Doctor Module</h1>
        <p className="text-gray-600 mt-1">Appointments, patient history, and treatment review</p>
      </header>

      {actionLoading && (
        <Card className="bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Processing your action...</p>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="text-lg font-semibold text-gray-800">{user?.name || 'Doctor'}</p>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pending appointments</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingAppointments.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Future appointments</p>
          <p className="text-3xl font-bold text-blue-600">{futureAppointments.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Patients with consent</p>
          <p className="text-3xl font-bold text-green-600">{patients.length}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-800">Appointments</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={appointmentFilter}
              onChange={(e) => setAppointmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All</option>
              <option value="future">Future only</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-gray-500">No appointments found for this filter.</p>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{appointment.childName}</p>
                    <p className="text-sm text-gray-600">Parent: {appointment.parentName} ({appointment.parentEmail})</p>
                    <p className="text-sm text-gray-600">Reason: {appointment.reason || 'Not specified'}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {appointment.appointmentDate} at {appointment.appointmentTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Consent to share data: {appointment.shareDataConsent ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>

                    {appointment.status === 'booked' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-800">Patients</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All risk levels</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <div className="space-y-2 text-gray-500">
            <p>No patients with consent yet.</p>
            <p className="text-sm">Only children whose parents consented to data sharing will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => {
              const latestAssessment = patient.assessments?.[0];
              const isExpanded = expandedPatientId === patient.childId;
              return (
                <div key={patient.childId} className="p-4 rounded-xl border border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{patient.childName}</p>
                      <p className="text-sm text-gray-600">Parent: {patient.parentName}</p>
                      <p className="text-sm text-gray-600">{patient.parentEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {latestAssessment ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          latestAssessment.riskLevel === 'high'
                            ? 'bg-red-100 text-red-700'
                            : latestAssessment.riskLevel === 'moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          Latest risk: {latestAssessment.riskLevel}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">No assessments yet</span>
                      )}
                      <button
                        onClick={() => setExpandedPatientId(isExpanded ? null : patient.childId)}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Hide report' : 'View detailed report'}
                      </button>
                    </div>
                  </div>

                  {latestAssessment ? (
                    <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Score: {latestAssessment.avgScore}
                      </p>
                      <p className="text-sm text-gray-700">
                        Assessment date: {new Date(latestAssessment.createdAt).toLocaleDateString()}
                      </p>
                      {isExpanded && (
                        <div className="mt-3 space-y-3">
                          {latestAssessment.recommendation?.title && (
                            <div>
                              <p className="font-medium text-gray-800">{latestAssessment.recommendation.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{latestAssessment.recommendation.description}</p>
                            </div>
                          )}
                          {latestAssessment.identifiedConditions?.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <p className="font-medium mb-1">Identified conditions:</p>
                              <ul className="list-disc ml-5 space-y-1">
                                {latestAssessment.identifiedConditions.map((item, index) => (
                                  <li key={index}>{item.condition?.name || item.name || 'Condition'}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">Assessment history:</p>
                            <ul className="space-y-2">
                              {patient.assessments.map((assessment) => (
                                <li key={assessment.id} className="p-2 bg-white rounded-lg border border-gray-200">
                                  <span className="font-medium">{new Date(assessment.createdAt).toLocaleDateString()}</span>
                                  <span className="ml-2 text-gray-500">Risk: {assessment.riskLevel}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No test results available for this patient yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-800">Future Appointments</h2>
        </div>
        {futureAppointments.length === 0 ? (
          <p className="text-gray-500">No upcoming appointments.</p>
        ) : (
          <div className="space-y-3">
            {futureAppointments.map((appointment) => (
              <div key={appointment.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{appointment.childName}</p>
                  <p className="text-sm text-gray-600">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">
            Update Password
          </button>
        </form>
        {passwordMessage && <p className="mt-3 text-sm text-gray-700">{passwordMessage}</p>}
      </Card>

      <Card className="bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">Doctor access</p>
            <p className="text-sm text-blue-800">You can confirm or reject appointments only for your own bookings. Parent consent is required before patient data becomes visible here.</p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}

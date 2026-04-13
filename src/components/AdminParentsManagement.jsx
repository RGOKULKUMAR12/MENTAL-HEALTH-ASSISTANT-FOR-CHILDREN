import { useState, useEffect } from 'react';
import Card from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../api/api';
import { Users, Baby, Trash2, Plus, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';

export default function AdminParentsManagement() {
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedParent, setExpandedParent] = useState(null);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [newParentForm, setNewParentForm] = useState({ name: '', email: '', password: '' });
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

  const deleteUser = async (userId, userName) => {
    const isConfirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete "${userName}" and all associated data.\n\nThis action cannot be undone. Are you sure?`
    );

    if (!isConfirmed) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (handleAuthError(response.status)) return;

      if (response.ok) {
        alert('✓ User deleted successfully');
        fetchAllUsers();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || 'Failed to delete user'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const deleteChild = async (childId, childName) => {
    const isConfirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete "${childName}" and all associated assessments/appointments.\n\nThis action cannot be undone. Are you sure?`
    );

    if (!isConfirmed) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:4000/api/admin/users/${childId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (handleAuthError(response.status)) return;

      if (response.ok) {
        alert('✓ Child deleted successfully');
        fetchAllUsers();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || 'Failed to delete child'}`);
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Failed to delete child: ' + error.message);
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

      {/* Parents & Children Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Parents & Children</h2>
              <p className="text-sm text-gray-600">{parents.length} families, {children.length} children</p>
            </div>
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
          <div className="text-center py-12">
            <p className="text-gray-500">Loading families...</p>
          </div>
        ) : parents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No families registered yet</p>
            <button
              onClick={() => setShowAddParentModal(true)}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            >
              Create first parent
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {parents.map((parent) => {
              const parentChildren = children.filter(
                (child) => Number(child.parent_id) === Number(parent.id)
              );
              const isExpanded = expandedParent === parent.id;

              return (
                <div key={parent.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Parent Header */}
                  <button
                    onClick={() => setExpandedParent(isExpanded ? null : parent.id)}
                    className="w-full px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{parent.name}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">Click to view family details</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                        {parentChildren.length} child{parentChildren.length !== 1 ? 'ren' : ''}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUser(parent.id, parent.name);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete parent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Children List */}
                  {isExpanded && (
                    <div className="px-4 py-4 bg-white border-t border-gray-200 space-y-2">
                      {parentChildren.length > 0 ? (
                        <div className="space-y-2">
                          {parentChildren.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                  <Baby className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-800">{child.name}</h4>
                                  <p className="text-xs text-gray-600">ID: {child.username}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteChild(child.id, child.name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="Delete child"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No children registered for this parent</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

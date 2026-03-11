/**
 * Parent-Children - Create child accounts and list children
 * Parent creates child with name, User ID, and password
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChildren } from '../contexts/ChildrenContext';
import { useAssessment } from '../contexts/AssessmentContext';
import Card from '../components/ui/Card';
import RiskBadge from '../components/ui/RiskBadge';
import { UserPlus, Users, Key, Trash2 } from 'lucide-react';

export default function ParentChildren() {
  const { user } = useAuth();
  const { createChild, getChildrenByParent, deleteChild, loading, error } = useChildren();
  const { getAssessment } = useAssessment();
  const parentId = user?.id;
  const children = getChildrenByParent(parentId);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [createdChild, setCreatedChild] = useState(null);
  const [childPendingDelete, setChildPendingDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateChild = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !username.trim() || !password.trim()) return;
    if (password.length < 4) {
      setFormError('Password must be at least 4 characters');
      return;
    }
    setActionLoading(true);
    try {
      const newChild = await createChild(parentId, name.trim(), username.trim(), password);
      setCreatedChild({ ...newChild, showCredentials: true });
      setName('');
      setUsername('');
      setPassword('');
      setShowCreateForm(false);
    } catch (err) {
      setFormError(err?.message || 'Failed to create child account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissCreated = () => {
    setCreatedChild(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">My Children</h1>
        <p className="text-gray-600 mt-1">Create child accounts and manage linked children</p>
      </header>

      {/* Create Child form */}
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Create child account
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Create a User ID and password for your child. They will use these to log in.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
            disabled={loading || actionLoading}
          >
            {loading ? 'Loading...' : 'Add child'}
          </button>
        ) : (
          <form onSubmit={handleCreateChild} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Child's name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Alex"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID (for login)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. alex123"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Child will use this to log in</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500"
                placeholder="Min 4 characters"
                minLength={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Share this with your child securely</p>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
              >
                {actionLoading ? 'Creating...' : 'Create account'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setName(''); setUsername(''); setPassword(''); }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* Created child credentials - show once */}
      {createdChild?.showCredentials && (
        <Card className="bg-primary-50 border-2 border-primary-200">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Key className="w-5 h-5" /> Account created
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Share these details with <strong>{createdChild.name}</strong> so they can log in.
          </p>
          <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
            <p className="text-sm"><span className="font-medium">User ID:</span> {createdChild.username}</p>
            <p className="text-sm mt-1"><span className="font-medium">Password:</span> (as you set)</p>
          </div>
          <button
            onClick={handleDismissCreated}
            className="text-sm text-primary-600 font-medium hover:underline"
          >
            Got it
          </button>
        </Card>
      )}

      {/* Linked children list */}
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> Your children
        </h2>
        {children.length === 0 ? (
          <p className="text-gray-600 py-4">No children yet. Create a child account above.</p>
        ) : (
          <div className="space-y-4">
            {children.map((child) => {
              const assessment = getAssessment(child.id);
              const isPendingDelete = childPendingDelete === child.id;
              return (
                <div
                  key={child.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{child.name}</p>
                    <p className="text-sm text-gray-500">User ID: {child.username}</p>
                    {assessment?.date && (
                      <p className="text-sm text-gray-500">Last check-in: {assessment.date}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {assessment?.riskLevel && <RiskBadge level={assessment.riskLevel} size="lg" />}
                    {!isPendingDelete ? (
                      <button
                        type="button"
                        onClick={() => setChildPendingDelete(child.id)}
                        className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Remove this child?</span>
                        <button
                          type="button"
                          onClick={async () => {
                            setFormError('');
                            setActionLoading(true);
                            try {
                              await deleteChild(parentId, child.id);
                              setChildPendingDelete(null);
                            } catch (err) {
                              setFormError(err?.message || 'Failed to remove child');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setChildPendingDelete(null)}
                          className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

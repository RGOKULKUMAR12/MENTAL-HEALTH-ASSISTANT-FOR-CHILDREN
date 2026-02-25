/**
 * Login Page - Parent: email + password | Child: User ID + password (created by parent)
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChildren } from '../contexts/ChildrenContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { findChildByCredentials } = useChildren();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = login(
        identifier,
        password,
        role,
        role === 'child' ? findChildByCredentials : undefined
      );
      if (!user && role === 'child') {
        setError('User ID or password is incorrect. Ask your parent to create your account.');
      } else if (user) {
        const dashboards = { child: '/dashboard/child', parent: '/dashboard/parent', admin: '/dashboard/admin' };
        navigate(dashboards[user.role]);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'parent', label: "I'm a parent", icon: '👨‍👩‍👧' },
    { value: 'child', label: "I'm a kid", icon: '🌱' },
    { value: 'admin', label: "I'm a counselor/admin", icon: '🏥' },
  ];

  const labelForIdentifier = role === 'child' ? 'User ID' : 'Email';
  const placeholderForIdentifier = role === 'child' ? 'Enter your User ID' : 'you@example.com';

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-soft-mint via-soft-sky to-soft-lavender">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-2">
            🌱 Mindful Kids
          </h1>
          <p className="text-gray-600 mb-8">
            Mental Health & Well-Being Support
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sign in as</label>
              <div className="flex gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setRole(r.value); setError(''); }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      role === r.value
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl block mb-1">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labelForIdentifier}
              </label>
              <input
                type={role === 'child' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={placeholderForIdentifier}
              />
              {role === 'child' && (
                <p className="text-xs text-gray-500 mt-1">Ask your parent for your User ID and password</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-600">
            Parent? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
      <div className="hidden md:block w-1/2 bg-primary-50 p-12 flex items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
            Supportive & Privacy-First
          </h2>
          <p className="text-gray-600 mb-4">
            Parents create child accounts. Children log in with User ID and password.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">✓ Parent creates child account first</li>
            <li className="flex items-center gap-2">✓ Child uses User ID + password to log in</li>
            <li className="flex items-center gap-2">✓ Check-ins and wellness activities</li>
            <li className="flex items-center gap-2">✓ Non-diagnostic support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Login Page - Parent: email + password | Child: User ID + password (created by parent)
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Users, Heart, Shield, Quote, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password, role);
      const dashboards = { child: '/dashboard/child', parent: '/dashboard/parent', admin: '/dashboard/admin', doctor: '/dashboard/doctor' };
      const fromPath = location.state?.from?.pathname;
      const fromSearch = location.state?.from?.search || '';
      navigate(fromPath ? `${fromPath}${fromSearch}` : dashboards[user.role]);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'parent', label: "I'm a parent", icon: Users },
    { value: 'child', label: "I'm a kid", icon: Heart },
    { value: 'doctor', label: "I'm a doctor", icon: Stethoscope },
    { value: 'admin', label: "I'm an admin", icon: Shield },
  ];

  const labelForIdentifier = role === 'child' ? 'User ID' : 'Email';
  const placeholderForIdentifier = role === 'child' ? 'Enter your User ID' : 'you@example.com';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-soft-mint via-soft-sky to-soft-lavender">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-2">
            Mindful Kids
          </h1>
          <p className="text-gray-600 mb-8">
            Mental Health and Well-Being Support
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sign in as</label>
              <div className="flex gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRole(r.value);
                        setError('');
                      }}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        role === r.value
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className="block mb-1">
                        <Icon className="w-5 h-5 mx-auto" />
                      </span>
                      {r.label}
                    </button>
                  );
                })}
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
                placeholder="........"
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

      <div className="hidden md:flex w-1/2 items-center p-10 lg:p-14">
        <div className="w-full max-w-xl bg-white/75 backdrop-blur-sm border border-white/70 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-5 text-primary-700">
            <Quote className="w-7 h-7" />
            <h2 className="font-display text-3xl leading-tight">Words That Lift You</h2>
          </div>
          <div className="space-y-6">
            <blockquote className="border-l-4 border-primary-300 pl-4">
              <p className="font-display text-2xl text-gray-800 leading-snug">"The greatest wealth is health."</p>
              <p className="mt-2 text-sm text-gray-600 font-semibold tracking-wide uppercase">Virgil</p>
            </blockquote>
            <blockquote className="border-l-4 border-primary-300 pl-4">
              <p className="font-display text-2xl text-gray-800 leading-snug">"Happiness depends upon ourselves."</p>
              <p className="mt-2 text-sm text-gray-600 font-semibold tracking-wide uppercase">Aristotle</p>
            </blockquote>
            <blockquote className="border-l-4 border-primary-300 pl-4">
              <p className="font-display text-2xl text-gray-800 leading-snug">"Nothing can dim the light that shines from within."</p>
              <p className="mt-2 text-sm text-gray-600 font-semibold tracking-wide uppercase">Maya Angelou</p>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

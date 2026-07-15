'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    veltech_id: '',
    email: '',
    phone_number: '',
    year_of_studying: '1',
    branch: '',
    role: 'student',
    discipline: 'engineering',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during registration');
      }

      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      <div className="bg-slate-900 p-8 md:p-10 rounded-3xl w-full max-w-2xl border border-slate-800 shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center">
          Join <span className="text-blue-500">Yantriksha</span>
        </h1>
        
        <p className="text-gray-400 text-center mt-3">
          Create your account and start your innovation journey
        </p>

        {error && (
          <div className="mt-6 p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-xl text-center text-sm">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-950/50 border border-green-800 text-green-400 rounded-xl text-center text-sm">
            🎉 {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Vel Tech ID / VTU Number */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Vel Tech ID / VTU Number</label>
              <input
                type="text"
                name="veltech_id"
                value={formData.veltech_id}
                onChange={handleChange}
                placeholder="e.g. VTU28891"
                className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">College Email (@veltech.edu.in)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@veltech.edu.in"
                className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Set a password"
                className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="mentor">Advisor / Mentor</option>
              </select>
            </div>

            {/* Discipline selection */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Discipline</label>
              <select
                name="discipline"
                value={formData.discipline}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
              >
                <option value="engineering">Engineering</option>
                <option value="law">Law</option>
                <option value="business">Business (MBA)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Conditional Student-only fields */}
          {formData.role === 'student' && (
            <div className="border-t border-slate-800 pt-6 mt-6 space-y-6">
              <h3 className="text-lg font-semibold text-blue-400">Student Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Phone Number */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                    required
                  />
                </div>

                {/* Year of Studying */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Year of Studying</label>
                  <select
                    name="year_of_studying"
                    value={formData.year_of_studying}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="e.g. CSE, ECE"
                    className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
                    required
                  />
                </div>

              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl hover:bg-blue-700 transition font-bold disabled:bg-blue-800 disabled:text-gray-400"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-500 transition">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}

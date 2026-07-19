'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COLLEGES = [
  { value: 'vel_tech', label: 'Vel Tech University', emailDomain: '@veltech.edu.in', idPlaceholder: 'e.g. VTU28891', idLabel: 'Vel Tech ID / VTU Number' },
  { value: 'anna_univ', label: 'Anna University', emailDomain: '@annauniv.edu', idPlaceholder: 'e.g. 2021501089', idLabel: 'University Roll Number' },
  { value: 'iit_madras', label: 'IIT Madras', emailDomain: '@iitm.ac.in', idPlaceholder: 'e.g. CS21B001', idLabel: 'Roll Number' },
  { value: 'nit_trichy', label: 'NIT Trichy', emailDomain: '@nitt.edu', idPlaceholder: 'e.g. 610519104001', idLabel: 'Roll Number' },
  { value: 'srm', label: 'SRM Institute of Science & Technology', emailDomain: '@srmist.edu.in', idPlaceholder: 'e.g. RA2011003010001', idLabel: 'Student ID' },
  { value: 'vit', label: 'VIT University', emailDomain: '@vit.ac.in', idPlaceholder: 'e.g. 21BCE1234', idLabel: 'Registration Number' },
  { value: 'sastra', label: 'SASTRA University', emailDomain: '@sastra.ac.in', idPlaceholder: 'e.g. 124001E', idLabel: 'Student ID' },
  { value: 'sathyabama', label: 'Sathyabama Institute of Science & Technology', emailDomain: '@sathyabama.ac.in', idPlaceholder: 'Student Roll Number', idLabel: 'Roll Number' },
  { value: 'saveetha', label: 'Saveetha Engineering College', emailDomain: '@saveetha.ac.in', idPlaceholder: 'Student Roll Number', idLabel: 'Roll Number' },
  { value: 'psnacet', label: 'P.S.N.A. College of Engineering', emailDomain: '@psnacet.edu.in', idPlaceholder: 'Student Roll Number', idLabel: 'Roll Number' },
  { value: 'other', label: 'Other College / University', emailDomain: '', idPlaceholder: 'Enter your student/roll number', idLabel: 'Student ID / Roll Number' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    college: 'vel_tech',
    college_name: '',
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const passwordsMatch = confirmPassword === '' ? null : formData.password === confirmPassword;

  const selectedCollege = COLLEGES.find(c => c.value === formData.college) || COLLEGES[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset email when college changes so stale domain doesn't stay
      ...(name === 'college' ? { email: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');

    // Password match check
    if (formData.password !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }

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

  const inputClass = [
    "w-full p-4 rounded-xl text-white outline-none border transition text-sm",
    "placeholder-gray-600",
    // Dark background override — fights browser autofill white flash
    "bg-slate-800/80 border-slate-700/60",
    "focus:border-blue-500 focus:bg-slate-800",
    // Override Chrome/Edge autofill yellow/white background
    "[&:-webkit-autofill]:bg-slate-800",
    "[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgb(30,41,59)]",
    "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]",
  ].join(' ');
  const labelClass = "block text-gray-400 mb-2 text-sm font-medium";

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-16 relative overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card rounded-3xl w-full max-w-2xl border border-slate-800/60 shadow-2xl relative z-10 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 w-full" />

        <div className="p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Join{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Yantriksha_X_Hub
              </span>
            </h1>
            <p className="text-gray-500 mt-3 text-sm">
              Create your account and start your innovation journey
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-800/60 text-red-400 rounded-xl text-center text-sm flex items-center justify-center gap-2">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 rounded-xl text-center text-sm flex items-center justify-center gap-2">
              🎉 {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* ── Full Name ── */}
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={inputClass}
                required
              />
            </div>

            {/* ── College / University Dropdown ── */}
            <div>
              <label className={labelClass}>
                College / University
                <span className="ml-2 text-xs text-blue-400/70 font-normal">(Select your institution)</span>
              </label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className={inputClass}
              >
                {COLLEGES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* College hint badge */}
              {selectedCollege.emailDomain && (
                <p className="mt-2 text-xs text-blue-400/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                  Official email domain: <span className="font-semibold text-blue-400">{selectedCollege.emailDomain}</span>
                </p>
              )}

              {/* ── "Other" college — type your college name ── */}
              {formData.college === 'other' && (
                <div className="mt-3 relative">
                  <input
                    type="text"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleChange}
                    placeholder="Type your college / university name"
                    className={`${inputClass} border-amber-500/40 focus:border-amber-400 bg-amber-950/10`}
                    required
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs font-bold uppercase tracking-wider pointer-events-none">
                    Required
                  </span>
                </div>
              )}
            </div>

            {/* ── Student ID + Email side by side ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{selectedCollege.idLabel}</label>
                <input
                  type="text"
                  name="veltech_id"
                  value={formData.veltech_id}
                  onChange={handleChange}
                  placeholder={selectedCollege.idPlaceholder}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  College Email
                  {selectedCollege.emailDomain && (
                    <span className="ml-1 text-xs text-gray-600">({selectedCollege.emailDomain})</span>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    selectedCollege.emailDomain
                      ? `yourname${selectedCollege.emailDomain}`
                      : 'your.college@email.com'
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* ── Password + Confirm Password side by side ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Password */}
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={inputClass}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`${labelClass} flex items-center gap-2`}>
                  Confirm Password
                  {passwordsMatch === true && (
                    <span className="text-emerald-400 text-xs font-bold">✓ Match</span>
                  )}
                  {passwordsMatch === false && (
                    <span className="text-red-400 text-xs font-bold">✗ No match</span>
                  )}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`${inputClass} ${
                    passwordsMatch === false
                      ? 'border-red-500/60 focus:border-red-500'
                      : passwordsMatch === true
                      ? 'border-emerald-500/60 focus:border-emerald-500'
                      : ''
                  }`}
                  autoComplete="new-password"
                  required
                />
              </div>

            </div>

            {/* Password error inline */}
            {passwordError && (
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                ❌ {passwordError}
              </p>
            )}

            {/* ── Role + Discipline side by side ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="mentor">Advisor / Mentor</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Discipline</label>
                <select
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="engineering">Engineering</option>
                  <option value="law">Law</option>
                  <option value="business">Business (MBA)</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* ── Student Profile Fields (conditional) ── */}
            {formData.role === 'student' && (
              <div className="border border-slate-800/60 bg-slate-900/40 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                  Student Profile Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Year of Study</label>
                    <select
                      name="year_of_studying"
                      value={formData.year_of_studying}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g. CSE, ECE, LLB"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-500 text-white py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-900/30 border border-blue-500/30 hover:-translate-y-0.5 hover:shadow-blue-700/40"
            >
              <span className="relative z-10">
                {loading ? 'Creating Account...' : 'Create Account →'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

          </form>

          <p className="text-gray-600 text-center mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">
              Login here →
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

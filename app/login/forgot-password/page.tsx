'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request reset link');

      setSuccess(data.message || 'Verification link sent successfully. Please check your inbox.');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-white text-center">
          Recover Password
        </h1>

        <p className="text-gray-400 text-center mt-3 text-xs leading-relaxed max-w-sm mx-auto">
          Enter your registered college email and we will send you a secure link to reset your password.
        </p>

        {error && (
          <div className="mt-6 p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-xl text-center text-sm">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-400 rounded-xl text-center text-sm">
            ✓ {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter College Email Address"
            className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition text-sm"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl hover:bg-blue-700 transition font-bold disabled:bg-blue-800 disabled:text-gray-400 text-sm"
          >
            {loading ? 'Sending link...' : 'Request Reset Link'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Remembered your password?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-500 transition font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}

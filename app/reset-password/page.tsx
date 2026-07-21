'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please check your recovery link.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess('Your password has been successfully updated!');
      setPassword('');
      setConfirmPassword('');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
      <h1 className="text-3xl font-extrabold text-white text-center">
        Create New Password
      </h1>

      <p className="text-gray-400 text-center mt-3 text-xs leading-relaxed max-w-sm mx-auto">
        Please enter and confirm your new secure password below to regain account access.
      </p>

      {error && (
        <div className="mt-6 p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-xl text-center text-sm">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-400 rounded-xl text-center text-sm">
          ✓ {success} Redirecting to login...
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password (min 6 chars)"
          className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition text-sm"
          required
          minLength={6}
          disabled={loading || !!success}
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition text-sm"
          required
          disabled={loading || !!success}
        />

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full bg-blue-600 py-4 rounded-xl hover:bg-blue-700 transition font-bold disabled:bg-blue-800 disabled:text-gray-400 text-sm"
        >
          {loading ? 'Resetting password...' : 'Save New Password'}
        </button>
      </form>

      <p className="text-gray-400 text-center mt-6 text-sm">
        Back to{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-500 transition font-semibold">
          Login page
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="text-white text-sm animate-pulse">Loading recovery context...</div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Invalid or missing invitation token link.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to setup password');

      setSuccessMsg(data.message || 'Account setup complete! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-white">Invalid Setup Link</h2>
        <p className="text-xs text-slate-400">The invitation link is invalid or missing required parameters. Please request a new invite from your administrator.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Set Up Core Team Password</h2>
        <p className="text-xs text-slate-400">Create a secure password to activate your official YantrikshaX Hub account.</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl text-center">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl text-center">
          ✨ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Secure Password</label>
          <input
            type="password"
            required
            placeholder="At least 8 characters..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
          <input
            type="password"
            required
            placeholder="Re-enter password..."
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-900/30 hover:shadow-blue-500/25"
        >
          {loading ? 'Activating Account...' : 'Set Password & Activate Account'}
        </button>
      </form>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Yantriksha</span>
            <span className="relative h-6 w-6 inline-block">
              <Image src="/logo.png" fill className="object-contain" alt="X" />
            </span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
          </Link>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading setup page...</div>}>
          <SetupPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

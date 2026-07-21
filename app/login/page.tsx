'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      if (data.user.role === 'admin') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
      router.refresh(); // Refresh route so server layout updates
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="bg-slate-900 p-10 rounded-3xl w-full max-w-md border border-slate-800 shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center">
          Login
        </h1>

        <p className="text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
          Welcome back to
          <span className="font-bold flex items-center text-sm text-white">
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
            <span className="inline-block relative h-6 w-8 mx-0.5 align-middle shrink-0">
              <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
            </span>
            <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
          </span>
        </p>

        {error && (
          <div className="mt-6 p-4 bg-red-950/50 border border-red-800 text-red-400 rounded-xl text-center text-sm">
            ❌ {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="College Email"
            className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500 transition"
            required
          />

          <div className="flex justify-end mt-1">
            <Link href="/login/forgot-password" className="text-xs text-blue-400 hover:text-blue-500 transition font-semibold">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl hover:bg-blue-700 transition font-bold disabled:bg-blue-800 disabled:text-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-500 transition font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
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

      router.push('/dashboard');
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

        <p className="text-gray-400 text-center mt-3">
          Welcome back to Yantriksha_X_Hub
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
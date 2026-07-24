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
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-stretch relative overflow-hidden">

      {/* Global ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ═══════════════════════════════════════════════
          LEFT BRAND PANEL (hidden on mobile)
      ═══════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/30 px-12 py-14 border-r border-slate-800/40 relative overflow-hidden">
        
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-0 w-56 h-56 bg-amber-500/8 rounded-full blur-[80px]" />

        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-700/50 group-hover:border-blue-500/60 transition shadow-lg">
              <Image src="/logo.png" alt="Yantriksha_X_Hub" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
            </div>
            <span className="text-lg font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
              <span className="inline-block relative h-7 w-9 mx-0.5 align-middle shrink-0">
                <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
              </span>
              <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>

          <div className="mt-20">
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Welcome Back to<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
                Yantriksha<br />Innovation Hub
              </span>
            </h2>
            <p className="mt-5 text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              Log in to track your team progress, access labs, view mentor reviews, and request prototype disbursements.
            </p>
          </div>

          {/* Feature list */}
          <ul className="mt-12 space-y-4">
            {[
              { icon: '💰', text: 'Seed funding up to ₹50,000' },
              { icon: '🎓', text: 'Expert mentorship & coaching' },
              { icon: '🚀', text: 'Full startup incubation support' },
              { icon: '🏆', text: 'Hackathons & innovation challenges' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-gray-400 font-light">
                <span className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-base shrink-0">
                  {icon}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-slate-600 italic">
          &quot;Supporting your startup journey from concept to market impact.&quot;
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT FORM PANEL
      ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-700">
              <Image src="/logo.png" alt="logo" fill className="object-contain" style={{ mixBlendMode: 'screen' }} />
            </div>
            <span className="text-base font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Yantriksha</span>
              <span className="inline-block relative h-6 w-8 mx-0.5 align-middle shrink-0">
                <Image src="/logo.png" fill className="object-contain" style={{ mixBlendMode: 'screen' }} alt="X" />
              </span>
              <span className="bg-gradient-to-r from-indigo-300 to-amber-300 bg-clip-text text-transparent">Hub</span>
            </span>
          </div>

          {/* Form card */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/60 shadow-2xl overflow-hidden">
            
            {/* Top gradient highlight strip */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

            <div className="p-8 md:p-10">
              <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Sign In</h1>
              <p className="text-gray-500 text-sm mb-7">Welcome back! Please enter your academic credentials.</p>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-950/60 border border-red-700/50 text-red-400 rounded-xl text-sm flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5">❌</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">College Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@veltech.edu.in"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-blue-500/80 transition"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                    <Link href="/login/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition font-semibold">
                      Forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-blue-500/80 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden group mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-500 text-white py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-900/30 border border-blue-500/20 hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...</>
                    ) : (
                      <>Sign In</>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <p className="text-center text-gray-600 text-xs pt-1">
                  Don&apos;t have an account yet?{' '}
                  <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                    Register here →
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import Link from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

const CORE_TEAM = [
  {
    name: 'Dr. Vignesh Kumar',
    role: 'Faculty Coordinator & Chief Patron',
    dept: 'Vel Tech R&D Institute',
    bio: 'Guiding cross-disciplinary student teams from problem discovery to patent filing and corporate commercialization.',
    image: '/logo.png', // Fallback to logo
    badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
  },
  {
    name: 'Vamsi Krishna',
    role: 'Student Founder & Engineering Lead',
    dept: 'Computer Science & Engineering',
    bio: 'Building scalable full-stack products and prototypes. Specializes in AI architectures and IoT sandbox deployments.',
    image: '/logo.png',
    badgeColor: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
  },
  {
    name: 'Aishwarya R.',
    role: 'Co-Founder & Legal Operations Lead',
    dept: 'School of Law',
    bio: 'Advising start-ups on IP protection, licensing agreement formulation, and regulatory compliance frameworks.',
    image: '/logo.png',
    badgeColor: 'bg-red-950/40 text-red-300 border-red-800/40',
  },
  {
    name: 'Rahul Sharma',
    role: 'Co-Founder & MBA Finance Lead',
    dept: 'School of Business',
    bio: 'Formulating go-to-market strategies, business model validation metrics, and early stage seed grant allocations.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  },
  {
    name: 'Deepak N.',
    role: 'Lead Systems Architect',
    dept: 'Electronics & Communication',
    bio: 'Designing embedded hardware modules, sensor array matrices, and microcontroller firmware integration.',
    image: '/logo.png',
    badgeColor: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
  },
  {
    name: 'Sneha Sen',
    role: 'Intellectual Property Advisor',
    dept: 'School of Law',
    bio: 'Assisting student innovators through patent search logs, prior-art validation, and provisional claim filing.',
    image: '/logo.png',
    badgeColor: 'bg-red-950/40 text-red-300 border-red-800/40',
  },
  {
    name: 'Karthik Raja',
    role: 'Club Treasurer & Operations Manager',
    dept: 'School of Business',
    bio: 'Overseeing funding claims verification, budget tracking, and vendor procurement log compliance.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      {/* Team Content */}
      <section className="max-w-7xl mx-auto px-6 py-28 md:py-36 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <span className="section-pill">✦ The Organizers</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-4">
            Meet the{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Core Team
            </span>
          </h1>
          <p className="mt-6 text-gray-400 text-sm md:text-base leading-relaxed">
            The cross-functional leaders bridging Engineering, Law, and Business to drive startup incubation and innovation across campuses.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CORE_TEAM.map((m, i) => (
            <div
              key={m.name}
              className="glass-card rounded-3xl p-6 border border-slate-800/60 shadow-lg relative group overflow-hidden transition-all duration-300 hover:border-slate-700 hover:-translate-y-1.5"
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    className="object-contain"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-snug">{m.name}</h3>
                  <p className="text-[11px] font-bold text-blue-400/80 mt-0.5">{m.role}</p>
                </div>
              </div>

              {/* Department pill */}
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mb-4 uppercase tracking-wider ${m.badgeColor}`}>
                {m.dept}
              </span>

              {/* Bio */}
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                {m.bio}
              </p>
            </div>
          ))}
        </div>

      </section>

      <Footer />

    </main>
  );
}

'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

const CHIEF_CORE_TEAM = [
  {
    name: 'Sannareddy Abhilash Reddy',
    role: 'President & Chief Products, Innovations, and Quality',
    dept: 'Executive Board',
    bio: 'Leads the overall vision, mission, and strategic direction of Yantriksha X Hub. Coordinates all departments, builds strategic industry partnerships, and reviews key projects.',
    image: '/logo.png',
    badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
  },
  {
    name: 'Kiran Sai',
    role: 'Secretary',
    dept: 'Executive Board',
    bio: 'Maintains official records, organizes core meetings, tracks project timelines, and coordinates communication across all departments.',
    image: '/logo.png',
    badgeColor: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
  },
  {
    name: 'Position Open',
    role: 'Deputy Secretary & Student Administration Head',
    dept: 'Executive Board',
    bio: 'Position open for recruitment. Assists in managing administrative tasks, student registration queues, and platform databases.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Head of Products and Innovations',
    dept: 'Products & Innovation',
    bio: 'Position open (5 vacancies). Leads product evaluation, guides prototyping labs, and coordinates cross-school technical project reviews.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Head of Quality',
    dept: 'Quality Assurance',
    bio: 'Position open. Formulates audit criteria, compliance benchmarks, and schedules milestone gates across the innovation journey.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Deputy of Products and Innovations',
    dept: 'Products & Innovation',
    bio: 'Position open (6 vacancies). Supports milestone review coordination, documents active project lifecycles, and assists product heads.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Deputy of Quality',
    dept: 'Quality Assurance',
    bio: 'Position open. Assists with compliance verification, milestone reports checklist tracking, and follow-ups with innovators.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Vamsi',
    role: 'Chief Industry, Alumni & Partnerships and Registration',
    dept: 'External Relations & Intake',
    bio: 'Establishes industrial collaborations and connects student innovators with mentors, tech experts, and registration coordinators.',
    image: '/logo.png',
    badgeColor: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
  },
  {
    name: 'Position Open',
    role: 'Head of Industry Alumni and Partnerships',
    dept: 'External Relations',
    bio: 'Position open. Leads outreach to industrial research organizations, alumni mentors, startup investors, and funding sponsors.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Deputy of Industry Alumni and Partnerships',
    dept: 'External Relations',
    bio: 'Position open. Coordinates networking events, schedules expert panel sessions, and maintains records of alumni connections.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Harisai',
    role: 'Chief of Marketing & Branding',
    dept: 'Marketing & Outreach',
    bio: 'Drives overall branding strategies, campaigns, and design assets to promote Yantriksha X Hub projects and initiatives.',
    image: '/logo.png',
    badgeColor: 'bg-pink-950/40 text-pink-300 border-pink-800/40',
  },
  {
    name: 'Position Open',
    role: 'Deputy of Marketing and Branding',
    dept: 'Marketing & Outreach',
    bio: 'Position open. Assists with creating social campaigns, maintaining visual graphics across channels, and handling student outreach.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Dr. A Mutharasan',
    role: 'Chief of Faculty Support & Finance',
    dept: 'Advisory Board',
    bio: 'Oversees financial allocations, seed funding verification workflows, and academic alignment.',
    image: '/logo.png',
    badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
  },
  {
    name: 'Sahithi & Varsha',
    role: 'Chief of Event Management',
    dept: 'Event Operations',
    bio: 'Coordinating workshops, technical hackathons, orientations, and logistical coordination for all activities.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  },
  {
    name: 'Position Open',
    role: 'Head of Event Management',
    dept: 'Event Operations',
    bio: 'Position open. Organizes hackathons, orientations, bootcamps, and schedules lab access check-ins.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Deputy of Event Management',
    dept: 'Event Operations',
    bio: 'Position open. Coordinates event logistics, volunteer pools, student registration desk, and certificates.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Nikitha',
    role: 'Chief of Startup Incubation & Intellectual Property (IP)',
    dept: 'Incubation & IP Support',
    bio: 'Guides startup onboarding, drafts provisional patent filings, and facilitates legal compliance.',
    image: '/logo.png',
    badgeColor: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
  },
  {
    name: 'Position Open',
    role: 'Head of Start Incubation and Intellectual Property (IP)',
    dept: 'Incubation & IP Support',
    bio: 'Position open. Facilitates patent specifications reviews, incubation onboardings with TBI, and legal advice.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
  {
    name: 'Position Open',
    role: 'Deputy of Start Incubation and Intellectual Property (IP)',
    dept: 'Incubation & IP Support',
    bio: 'Position open. Assists startup teams with patent paperwork, R&D databases, and advisor meeting coordination.',
    image: '/logo.png',
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40 animate-pulse',
    isOpen: true,
  },
];

const CORE_TEAM_ROLES = [
  {
    roleId: '1',
    roleName: 'President',
    assignedTo: 'Sannareddy Abhilash Reddy',
    tenure: '4th Year',
    department: 'Executive Board',
    responsibilities: [
      'Leads the overall vision, mission, and strategic direction of Yantriksha X Hub.',
      'Oversees all departments and ensures effective coordination across teams.',
      'Reviews and approves major initiatives, projects, and organizational decisions.',
      'Represents Yantriksha X Hub in institutional, industry, and external collaborations.',
      'Builds strategic partnerships with industries, startups, incubators, and investors.',
    ],
    badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
  },
  {
    roleId: '2',
    roleName: 'Secretary',
    assignedTo: '', // Open / Placeholder
    tenure: '3rd Year',
    department: 'Administration',
    responsibilities: [
      'Maintains official records, reports, and organizational documentation.',
      'Organizes meetings, prepares agendas, and records minutes of meetings.',
      'Coordinates communication between all departments and the Core Team.',
      'Tracks action items, project timelines, and organizational follow-ups.',
    ],
    badgeColor: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
  },
  {
    roleId: '3',
    roleName: 'Deputy Secretary & Student Administration Head',
    assignedTo: '', // Open
    tenure: '2nd Year',
    department: 'Administration & Admissions',
    responsibilities: [
      'Assists the Secretary in managing administrative activities.',
      'Manages all student registrations, membership records, attendance, and the central database.',
      'Coordinates onboarding and orientation of new members.',
      'Handles registrations for workshops, events, hackathons, and other initiatives.',
      'Ensures smooth communication between students and department heads.',
    ],
    badgeColor: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
  },
  {
    roleId: '4.1',
    roleName: 'Head of Products and Innovations',
    assignedTo: '', // Open (5 members)
    tenure: '3rd Year (5 members: SOC, SOEC, SOMC, SOM, SOL)',
    department: 'Products & Innovation',
    responsibilities: [
      'Review and evaluate project ideas submitted by students from their respective schools.',
      'Guide teams in research, product development, prototype design, and implementation.',
      'Provide technical and domain-specific mentorship throughout the project lifecycle.',
      'Coordinate with other departmental heads to ensure successful project execution.',
      'Monitor project progress and recommend improvements for innovation and scalability.',
    ],
    badgeColor: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
  },
  {
    roleId: '4.2',
    roleName: 'Head of Quality',
    assignedTo: '', // Open (1 member)
    tenure: '3rd Year (1 member)',
    department: 'Quality Assurance',
    responsibilities: [
      'Establish quality standards and review processes for all projects.',
      'Evaluate project documentation, prototypes, and deliverables for quality and completeness.',
      'Conduct periodic quality reviews and provide feedback for improvements.',
      'Ensure projects follow Yantriksha X Hub guidelines and best practices.',
      'Coordinate with all departments to maintain consistency and excellence across projects.',
    ],
    badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
  },
  {
    roleId: '5.1',
    roleName: 'Deputy of Products and Innovations',
    assignedTo: '', // Open (6 members)
    tenure: '2nd Year (6 members: SOC, SOEC, SOMC, SOM, SOL)',
    department: 'Products & Innovation',
    responsibilities: [
      'Assist the Head in reviewing and tracking student projects.',
      'Support project teams in documentation, research, and prototype development.',
      'Coordinate communication between student teams and the department head.',
      'Maintain project progress records and status updates.',
      'Assist in organizing product reviews, demonstrations, and innovation activities.',
    ],
    badgeColor: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
  },
  {
    roleId: '5.2',
    roleName: 'Deputy of Quality',
    assignedTo: '', // Open (1 member)
    tenure: '2nd Year (1 member)',
    department: 'Quality Assurance',
    responsibilities: [
      'Assist the Head of Quality in reviewing project deliverables.',
      'Verify documentation, reports, and project submissions for completeness.',
      'Maintain quality review records and improvement reports.',
      'Follow up with project teams to ensure quality recommendations are implemented.',
      'Support quality audits, review meetings, and evaluation activities.',
    ],
    badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
  },
  {
    roleId: '6',
    roleName: 'Head of Industry Alumni and Partnerships',
    assignedTo: '', // Open
    tenure: '3rd Year (1 member)',
    department: 'External Relations',
    responsibilities: [
      'Establishes collaborations with industries, alumni, and research organizations.',
      'Connects students with mentors, experts, and industry professionals.',
      'Coordinates guest lectures, and partnership activities.',
      'Maintains long-term relationships with external stakeholders.',
    ],
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  },
  {
    roleId: '7',
    roleName: 'Deputy of Industry Alumni and Partnerships',
    assignedTo: '', // Open
    tenure: '2nd Year (1 member)',
    department: 'External Relations',
    responsibilities: [
      'Assists in maintaining industry and alumni relationships.',
      'Coordinates meetings and follow-ups with external partners.',
      'Maintains partnership and alumni records.',
      'Supports collaboration and networking activities.',
    ],
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
  },
  {
    roleId: '8',
    roleName: 'Head of Marketing and Branding',
    assignedTo: '', // Open
    tenure: '3rd Year (1 member)',
    department: 'Marketing & Outreach',
    responsibilities: [
      'Develops branding strategies for Yantriksha X Hub.',
      'Manages social media platforms and promotional campaigns.',
      'Oversees the design of promotional and branding materials.',
      'Promotes events, projects, achievements, and organizational initiatives.',
    ],
    badgeColor: 'bg-pink-950/40 text-pink-300 border-pink-800/40',
  },
  {
    roleId: '9',
    roleName: 'Deputy of Marketing and Branding',
    assignedTo: '', // Open
    tenure: '2nd Year (1 member)',
    department: 'Marketing & Outreach',
    responsibilities: [
      'Assists in creating promotional content and branding materials.',
      'Supports social media management and publicity campaigns.',
      'Coordinates student outreach and promotional activities.',
      'Ensures consistent branding across all platforms.',
    ],
    badgeColor: 'bg-pink-950/40 text-pink-300 border-pink-800/40',
  },
  {
    roleId: '10',
    roleName: 'Head of Event Management',
    assignedTo: '', // Open
    tenure: '3rd Year (1 member)',
    department: 'Event Operations',
    responsibilities: [
      'Coordination with IIC workshops.',
      'Plans and manages workshops, hackathons, seminars, and innovation events.',
      'Coordinates event schedules, logistics, and execution.',
      'Manages event teams and volunteer coordination.',
      'Ensures successful execution of all organizational events.',
    ],
    badgeColor: 'bg-orange-950/40 text-orange-300 border-orange-800/40',
  },
  {
    roleId: '11',
    roleName: 'Deputy of Event Management',
    assignedTo: '', // Open
    tenure: '2nd Year (1 member)',
    department: 'Event Operations',
    responsibilities: [
      'Assists in planning and organizing organizational events.',
      'Coordinates registrations, logistics, and volunteer management.',
      'Supports smooth event execution and operations.',
      'Collects event feedback and prepares post-event reports.',
    ],
    badgeColor: 'bg-orange-950/40 text-orange-300 border-orange-800/40',
  },
  {
    roleId: '12',
    roleName: 'Head of Start Incubation and Intellectual Property (IP)',
    assignedTo: '', // Open
    tenure: '2nd Year (1 MBA/BBA and 1 LAW member)',
    department: 'Incubation & IP Support',
    responsibilities: [
      'Guides startup teams through incubation and business development.',
      'Supports patent identification, filing guidance, and IP protection.',
      'Connects teams with incubators, investors, and funding opportunities.',
      'Promotes entrepreneurship and startup ecosystem development.',
    ],
    badgeColor: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
  },
  {
    roleId: '13',
    roleName: 'Deputy of Start Incubation and Intellectual Property (IP)',
    assignedTo: '', // Open
    tenure: '1st Year (1 MBA/BBA and 1 LAW member)',
    department: 'Incubation & IP Support',
    responsibilities: [
      'Coordination with R&D and Technology Business Incubator (TBI).',
      'Assists startup teams during incubation activities.',
      'Supports patent and IP documentation processes.',
      'Coordinates mentorship and investor interactions.',
      'Tracks startup progress and incubation milestones.',
    ],
    badgeColor: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
  },
];

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'chief' | 'structure'>('chief');

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      {/* Team Content */}
      <section className="max-w-7xl mx-auto px-6 py-28 md:py-36 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="section-pill">✦ Operational Leadership</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-4">
            Organizational{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Structure & Roles
            </span>
          </h1>
          <p className="mt-6 text-gray-400 text-sm md:text-base leading-relaxed">
            The structural roles and student officers bridging Engineering, Law, and Business to drive startup incubation and patent filings.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-16">
          <div className="bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chief')}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 ${
                activeTab === 'chief'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chief Core Team
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 ${
                activeTab === 'structure'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Core Team Roles & Details
            </button>
          </div>
        </div>

        {/* Tab 1: Chief Core Team */}
        {activeTab === 'chief' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CHIEF_CORE_TEAM.map((m) => (
              <div
                key={`${m.name}-${m.role}`}
                className={`glass-card rounded-3xl p-6 shadow-lg relative group overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
                  (m as any).isOpen 
                    ? 'border border-dashed border-amber-500/25 bg-amber-950/5 hover:border-amber-500/40' 
                    : 'border border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Profile Card Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`relative h-14 w-14 rounded-2xl overflow-hidden border shrink-0 bg-slate-950 ${
                      (m as any).isOpen ? 'border-dashed border-amber-500/30' : 'border-slate-800'
                    }`}>
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        className="object-contain"
                        style={{ mixBlendMode: 'screen' }}
                      />
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-base leading-snug ${(m as any).isOpen ? 'text-amber-400' : 'text-white'}`}>{m.name}</h3>
                      <p className="text-[11px] font-bold text-blue-400/85 mt-0.5 leading-snug">{m.role}</p>
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
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Core Team Roles */}
        {activeTab === 'structure' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CORE_TEAM_ROLES.map((r) => (
              <div
                key={r.roleId}
                className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800/60 shadow-lg relative transition-all duration-300 hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  {/* Role Header */}
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-400 tracking-widest uppercase">
                        Role ID: {r.roleId}
                      </span>
                      <h3 className="text-xl font-black text-white mt-1 leading-snug">
                        {r.roleName}
                      </h3>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-3 uppercase tracking-wider ${r.badgeColor}`}>
                        {r.department}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gray-500 block">Class / Tenure</span>
                      <span className="text-xs font-extrabold text-gray-300 mt-1 block">{r.tenure}</span>
                    </div>
                  </div>

                  {/* Assigned Officer Status */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Assigned Officer</span>
                    {r.assignedTo ? (
                      <span className="text-sm font-extrabold text-white mt-1 block">
                        {r.assignedTo}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <span className="text-xs font-bold text-amber-300">
                          Position Open / TBD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Responsibilities list */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-300 mb-3 uppercase tracking-wider">
                      Roles & Responsibilities:
                    </h4>
                    <ul className="space-y-2">
                      {r.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed font-light">
                          <span className="text-blue-500 shrink-0 mt-1 text-[10px]">➢</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />

    </main>
  );
}

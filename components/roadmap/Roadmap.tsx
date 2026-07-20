'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Milestone {
  number: string;
  stage: string;
  title: string;
  desc: string;
  stageColor: string;
  badgeColor: string;
  dotColor: string;
  borderHoverColor: string;
  checklist: string[];
}

const roadmapData: Milestone[] = [
  {
    number: "01",
    stage: "Stage -1: Confusion",
    title: "Problem Discovery",
    desc: "Identify high-impact, real-world pain points in society or industry. Perform preliminary searches on literature and patent databases to ensure originality.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500",
    borderHoverColor: "hover:border-red-500/40",
    checklist: ["Formulate initial problem hypothesis", "Review 5 academic literature papers", "Perform Google Patent prior-art search"]
  },
  {
    number: "02",
    stage: "Stage -1: Confusion",
    title: "Cross-Disciplinary Team",
    desc: "Assemble a compliant 10-member student team bridging Engineering, Law, and Business faculties, guided by a Faculty Advisor.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500",
    borderHoverColor: "hover:border-red-500/40",
    checklist: ["Onboard 4 Engineering, 3 Law, and 3 MBA students", "Sign-off Faculty Advisor alignment log", "Register team details in Yantriksha registry"]
  },
  {
    number: "03",
    stage: "Stage 0: Idea",
    title: "Idea Validation",
    desc: "Validate the problem statements by conducting user surveys and field research. Define the core value proposition of your startup solution.",
    stageColor: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    dotColor: "bg-yellow-500",
    borderHoverColor: "hover:border-yellow-500/40",
    checklist: ["Survey 50 potential target users", "Conduct 5 face-to-face consumer interviews", "Draft Business Model Canvas (BMC) value block"]
  },
  {
    number: "04",
    stage: "Stage 0: Idea",
    title: "Prototype Blueprinting",
    desc: "Draft complete schematics, technical flowcharts, and hardware component lists required for fabricating the prototype.",
    stageColor: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    dotColor: "bg-yellow-500",
    borderHoverColor: "hover:border-yellow-500/40",
    checklist: ["Create electrical circuit CAD schematics", "Select microcontrollers, sensors, and actuators", "Design physical enclosure structural dimensions"]
  },
  {
    number: "05",
    stage: "Stage 0: Idea",
    title: "Feasibility Review",
    desc: "Verify feasibility across three incubation pillars: engineering viability, business market sizing, and legal patent/prior-art search clearance.",
    stageColor: "text-yellow-400",
    badgeColor: "bg-yellow-950/40 text-yellow-400 border-yellow-900/50",
    dotColor: "bg-yellow-500",
    borderHoverColor: "hover:border-yellow-500/40",
    checklist: ["Complete engineering blueprint verification", "Formulate Total Addressable Market (TAM) sizing", "Document prior-art patent search checklist"]
  },
  {
    number: "06",
    stage: "Stage 1: Product",
    title: "Resource Request",
    desc: "Submit your final itemized bill of materials (BOM) to the incubation panel for review and component procurement approval.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Detail components supplier links & quotes", "Submit Bill of Materials (BOM) for approval", "Verify components delivery logs in sandbox storage"]
  },
  {
    number: "07",
    stage: "Stage 1: Product",
    title: "Seed Funding Request",
    desc: "Secure prototype seed grants. Eligible teams can claim up to ₹50,000 for purchasing components and hiring fabrication services.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Upload official parts invoices to dashboard", "Complete treasurer bank account linking", "Receive advisor sign-off for grant disbursement"]
  },
  {
    number: "08",
    stage: "Stage 1: Product",
    title: "Mentorship Connect",
    desc: "Schedule expert review slots to optimize your prototype performance, design packaging, and draft legal patent claims.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Book 1-on-1 session with Engineering Mentor", "Review financial unit economics with MBA Lead", "Draft patent claim outlines with Law Advisor"]
  },
  {
    number: "09",
    stage: "Stage 1: Product",
    title: "Progress Reporting",
    desc: "Submit bi-weekly reports tracking prototype benchmarks, testing outcomes, and seed funding spending.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Document bi-weekly technical performance stats", "File seed funding spent-budget logs", "Submit progress report for coordinator validation"]
  },
  {
    number: "10",
    stage: "Stage 1: Product",
    title: "Hackathon Challenge",
    desc: "Test your MVP in external competitions. Participate in Smart India Hackathon (SIH) or other regional ideathons for external validation.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Register MVP prototype for SIH sandbox track", "Complete 5-minute live investor pitch deck", "Log jury/peer feedback comments inside dashboard"]
  },
  {
    number: "11",
    stage: "Stage 1: Product",
    title: "Sandbox Testing",
    desc: "Conduct bi-monthly real-world environment tests. Log telemetry data and structural integrity during continuous sandbox operations.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Run prototype under continuous load for 2 hours", "Identify and log 3 operational failure points", "Incorporate safety fail-safes in firmware code"]
  },
  {
    number: "12",
    stage: "Stage 1: Product",
    title: "Research & IPR filing",
    desc: "Protect your proprietary tech. Work with School of Law advisors to file patents, register trademarks, or draft research publications.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Finalize patent prior-art documentation log", "Draft and submit provisional patent application", "Submit research abstract for conference publication"]
  },
  {
    number: "13",
    stage: "Stage 1: Product",
    title: "Commercialization Plan",
    desc: "Formulate pricing models, go-to-market strategies, and pitch your startup to early stage venture capitals or angel investors.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Formulate customer acquisition cost (CAC) metrics", "Design Go-To-Market (GTM) rollout timelines", "Conduct mock pitches with 3 incubation experts"]
  },
  {
    number: "14",
    stage: "Stage 1: Product",
    title: "Startup Launch",
    desc: "Register your startup as a private limited entity, open a business bank account, and officially deploy your product to the market.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Complete MCA company registration documents", "Obtain official startup GST number credentials", "Deploy live production app and welcome first customers"]
  }
];

// Coordinates along the winding S-curve road in a 400x900 SVG viewport
const STOPS_COORDINATES = [
  { x: 80, y: 50, rot: 30 },     // Stop 1
  { x: 200, y: 110, rot: 15 },   // Stop 2
  { x: 320, y: 170, rot: 135 },  // Stop 3
  { x: 200, y: 230, rot: 165 },  // Stop 4
  { x: 80, y: 290, rot: 30 },    // Stop 5
  { x: 200, y: 350, rot: 15 },   // Stop 6
  { x: 320, y: 410, rot: 135 },  // Stop 7
  { x: 200, y: 470, rot: 165 },  // Stop 8
  { x: 80, y: 530, rot: 30 },    // Stop 9
  { x: 200, y: 590, rot: 15 },   // Stop 10
  { x: 320, y: 650, rot: 135 },  // Stop 11
  { x: 200, y: 710, rot: 165 },  // Stop 12
  { x: 80, y: 770, rot: 30 },    // Stop 13
  { x: 200, y: 830, rot: 90 }    // Stop 14
];

export default function Roadmap() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedIdx(prev => {
          if (prev >= roadmapData.length - 1) {
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle resetting and pausing when reaching the end of the trip
  useEffect(() => {
    if (isPlaying && selectedIdx === roadmapData.length - 1) {
      const resetTimer = setTimeout(() => {
        setSelectedIdx(0);
        setIsPlaying(false);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }
  }, [selectedIdx, isPlaying]);

  const activeMilestone = roadmapData[selectedIdx];
  const activeCoord = STOPS_COORDINATES[selectedIdx];

  // Dynamic car paint & underglow matching the current stage color
  let carThemeColor = '#3b82f6';
  let carGlowColor = 'rgba(59, 130, 246, 0.2)';
  let carHeadlightColor = '#00f2fe';

  let activeBorderGlow = 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
  let activeStageText = 'text-blue-400';

  if (activeMilestone.stage.includes('Confusion')) {
    carThemeColor = '#ef4444';
    carGlowColor = 'rgba(239, 68, 68, 0.35)';
    carHeadlightColor = '#fca5a5';
    activeBorderGlow = 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    activeStageText = 'text-red-400';
  } else if (activeMilestone.stage.includes('Idea')) {
    carThemeColor = '#f59e0b';
    carGlowColor = 'rgba(245, 158, 11, 0.35)';
    carHeadlightColor = '#fde047';
    activeBorderGlow = 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
    activeStageText = 'text-amber-400';
  } else if (activeMilestone.stage.includes('Product')) {
    carThemeColor = '#10b981';
    carGlowColor = 'rgba(16, 185, 129, 0.35)';
    carHeadlightColor = '#6ee7b7';
    activeBorderGlow = 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    activeStageText = 'text-emerald-400';
  }



  return (
    <section id="roadmap" className="bg-slate-950 py-16 text-white relative overflow-hidden">
      
      {/* Safe responsive stylesheet to bypass SSR hydration mismatches */}
      <style dangerouslySetInnerHTML={{ __html: `
        .road-col { width: 145px !important; padding: 10px !important; }
        .road-track { width: 120px !important; height: 100% !important; min-height: 380px !important; }
        
        @media (min-width: 640px) {
          .road-col { width: 250px !important; padding: 16px !important; }
          .road-track { width: 210px !important; height: 100% !important; min-height: 460px !important; }
        }
        @media (min-width: 1024px) {
          .road-col { width: auto !important; padding: 24px !important; }
          .road-track { width: 400px !important; height: 100% !important; min-height: 460px !important; }
        }
      `}} />
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 z-10 relative">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-blue-500 font-extrabold tracking-widest text-sm uppercase block">
            ✦ INTERACTIVE INCUBATION HIGHWAY
          </span>
          <h2 className="fluid-h2 font-extrabold mt-4 tracking-tight leading-tight">
            Your Startup{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Incubation Highway
            </span>
          </h2>
          <p className="mt-6 text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
            Click on any stop along the cyber highway path to drive the Yantriksha rover to that milestone and reveal the detailed startup requirements!
          </p>

          {/* Drive Simulator Controller */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                if (!isPlaying) {
                  setSelectedIdx(0);
                }
                setIsPlaying(!isPlaying);
              }}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition border ${
                isPlaying
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white shadow-lg shadow-blue-900/30'
              }`}
            >
              <span>{isPlaying ? '⏸ Pause Auto-Drive' : '🏎️ Simulate Road-Trip'}</span>
            </button>
          </div>
        </div>

        {/* Highway Winding Canvas & Detail Split Layout */}
        <div className="flex lg:grid lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-12 items-start mt-12 w-full">
          
          {/* LEFT COLUMN: The Winding Highway Track Map (col-span-6 on desktop, dynamic width on mobile) */}
          <div className="road-col lg:col-span-6 flex justify-center relative bg-slate-900/30 border border-slate-900/60 rounded-2xl sm:rounded-3xl backdrop-blur shrink-0">
            
            {/* Ambient track glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[40px] sm:blur-[70px] pointer-events-none" />

            <div className="road-track relative">
              
              {/* SVG Highway Winding Path (Stretches vertically to cover the space!) */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 900"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0"
                preserveAspectRatio="none"
              >
                {/* 1. Glow border under the road */}
                <path
                  d="M 80,50 Q 200,80 200,110 Q 200,140 320,170 Q 200,200 200,230 Q 200,260 80,290 Q 200,320 200,350 Q 200,380 320,410 Q 200,440 200,470 Q 200,500 80,530 Q 200,560 200,590 Q 200,620 320,650 Q 200,680 200,710 Q 200,740 80,770 Q 200,800 200,830"
                  stroke="#3b82f6"
                  strokeWidth="28"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.1"
                />

                {/* 2. Asphalt Road Base */}
                <path
                  d="M 80,50 Q 200,80 200,110 Q 200,140 320,170 Q 200,200 200,230 Q 200,260 80,290 Q 200,320 200,350 Q 200,380 320,410 Q 200,440 200,470 Q 200,500 80,530 Q 200,560 200,590 Q 200,620 320,650 Q 200,680 200,710 Q 200,740 80,770 Q 200,800 200,830"
                  stroke="#1e293b"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Center Yellow Dashed Divider Lane */}
                <path
                  d="M 80,50 Q 200,80 200,110 Q 200,140 320,170 Q 200,200 200,230 Q 200,260 80,290 Q 200,320 200,350 Q 200,380 320,410 Q 200,440 200,470 Q 200,500 80,530 Q 200,560 200,590 Q 200,620 320,650 Q 200,680 200,710 Q 200,740 80,770 Q 200,800 200,830"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="6, 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />

              </svg>

              {/* 4. Glowing Cyber Rover Car Absolute Overlay (never deforms!) */}
              <div 
                className="absolute pointer-events-none z-20"
                style={{ 
                  left: `${(activeCoord.x / 400) * 100}%`, 
                  top: `${(activeCoord.y / 900) * 100}%`,
                  width: '48px',
                  height: '28px',
                  marginLeft: '-24px',
                  marginTop: '-14px',
                  transform: `rotate(${activeCoord.rot}deg)`,
                  transition: 'left 0.9s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.9s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.9s ease'
                }}
              >
                <svg width="48" height="28" viewBox="-24 -14 48 28" fill="none">
                  {/* Outer laser hover glow */}
                  <rect x="-24" y="-14" width="48" height="28" rx="8" fill={carGlowColor} filter="blur(4px)" style={{ transition: 'fill 0.5s ease' }} />
                  {/* Cyber sports car chassis */}
                  <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#0f172a" stroke={carThemeColor} strokeWidth="2.5" style={{ transition: 'stroke 0.5s ease' }} />
                  {/* Windshield */}
                  <rect x="5" y="-7" width="9" height="14" rx="2" fill={carHeadlightColor} opacity="0.8" style={{ transition: 'fill 0.5s ease' }} />
                  {/* Dual Neon Headlights */}
                  <circle cx="16" cy="-5" r="2" fill={carHeadlightColor} style={{ transition: 'fill 0.5s ease' }} />
                  <circle cx="16" cy="5" r="2" fill={carHeadlightColor} style={{ transition: 'fill 0.5s ease' }} />
                  {/* Rear exhaust thrust flame */}
                  <path d="M -18 0 L -29 -4 L -25 0 L -29 4 Z" fill={carThemeColor} opacity="0.75" style={{ transition: 'fill 0.5s ease' }} />
                </svg>
              </div>

              {/* 5. Stops / Milestones Overlay Buttons */}
              {STOPS_COORDINATES.map((stop, idx) => {
                const milestone = roadmapData[idx];
                const isSelected = selectedIdx === idx;
                
                // Set color scheme depending on stage phase
                let stopGlow = 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]';
                if (milestone.stage.includes('Confusion')) {
                  stopGlow = 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]';
                } else if (milestone.stage.includes('Idea')) {
                  stopGlow = 'bg-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.8)]';
                } else {
                  stopGlow = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
                }

                // Adjust positions inside SVG viewbox relative values
                const leftPercent = `${(stop.x / 400) * 100}%`;
                const topPercent = `${(stop.y / 900) * 100}%`;

                return (
                  <button
                    key={idx}
                    onClick={() => { setSelectedIdx(idx); setIsPlaying(false); }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: leftPercent, top: topPercent }}
                  >
                    {/* Ring Pulse for active stop */}
                    {isSelected && (
                      <span className="absolute inset-[-5px] sm:inset-[-10px] rounded-full bg-blue-500/20 border border-blue-400/40 animate-ping pointer-events-none" />
                    )}

                    {/* Glowing Stop Circle */}
                    <div className={`h-5 w-5 sm:h-7 sm:w-7 rounded-full border-[2px] sm:border-[3.5px] border-slate-950 flex items-center justify-center font-black text-[7px] sm:text-[9px] cursor-pointer transition duration-300 hover:scale-125 ${
                      isSelected 
                        ? 'bg-white text-slate-950 scale-110 shadow-[0_0_15px_#ffffff]'
                        : `${stopGlow} text-white`
                    }`}>
                      {milestone.number}
                    </div>

                    {/* Tooltip Hover tag */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg">
                      {milestone.title}
                    </div>
                  </button>
                );
              })}

            </div>
          </div>

          {/* RIGHT COLUMN: The Interactive Milestone Control Dashboard (col-span-6 on desktop, flex-1 remaining width on mobile) */}
          <div className="flex-1 min-w-0 lg:col-span-6 space-y-4 lg:space-y-6">
            
            {/* Highlighted selected Card */}
            <div className="glass-card rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/10 min-h-[380px] sm:min-h-[460px] flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/5 rounded-full blur-[40px] pointer-events-none" />
              
              <div>
                
                {/* Header Tag info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-5 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-gray-500 font-bold text-[9px] sm:text-sm tracking-wider font-mono">
                      STOP #{activeMilestone.number}
                    </span>
                    <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border uppercase tracking-wider ${activeMilestone.badgeColor}`}>
                      {activeMilestone.stage.split(': ')[1] || activeMilestone.stage}
                    </span>
                  </div>
                  <span className="text-[8px] sm:text-xs text-gray-500 font-bold">Incubation Phase</span>
                </div>

                {/* Stop Title */}
                <h3 className="text-base sm:text-3xl font-black mt-3 sm:mt-6 tracking-tight text-white">
                  {activeMilestone.title}
                </h3>

                {/* Stop Description */}
                <p className="text-gray-300 text-[10px] sm:text-sm mt-2 sm:mt-4 leading-relaxed font-light">
                  {activeMilestone.desc}
                </p>

                {/* Milestone Quest Checklist */}
                <div className="mt-4 sm:mt-8 bg-slate-950/60 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-800/80">
                  <h4 className="text-[9px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3.5">
                    📋 Checklist to Pass this Stop:
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2.5 text-[9px] sm:text-xs text-gray-400">
                    {activeMilestone.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 sm:gap-2.5 leading-relaxed">
                        <span className="text-blue-500 shrink-0">✔</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Join Incubation Club callout */}
              <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row justify-between items-center bg-blue-600/5 border border-blue-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 gap-3 sm:gap-4 text-center sm:text-left">
                <div className="text-left">
                  <h4 className="font-bold text-[10px] sm:text-xs text-white">Inspired to launch your product?</h4>
                  <p className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1 leading-normal">Form your 10-member team and request your ₹50k seed funding today!</p>
                </div>
                <a
                  href="/register"
                  className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-750 text-white font-bold text-[9px] sm:text-xs px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg shadow-blue-900/30 hover:-translate-y-0.5 shrink-0"
                >
                  Join Hub Now →
                </a>
              </div>

            </div>

          </div>

        </div>

        {/* Stage Quick Jump Shortcuts (Moved outside to take full width and cover the empty space) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-4 mt-8 sm:mt-12 w-full">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
            🚀 Quick Jump Stops by Stages
          </h4>
          
          <div className="space-y-3">
            {/* Stage -1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Stage -1 (Confusion)</span>
              <div className="flex gap-2 flex-wrap">
                {roadmapData.filter(item => item.stage.includes('Stage -1')).map(item => {
                  const idx = roadmapData.findIndex(r => r.number === item.number);
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={item.number}
                      onClick={() => { setSelectedIdx(idx); setIsPlaying(false); }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110'
                          : 'bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/20'
                      }`}
                    >
                      {item.number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage 0 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Stage 0 (Idea)</span>
              <div className="flex gap-2 flex-wrap">
                {roadmapData.filter(item => item.stage.includes('Stage 0')).map(item => {
                  const idx = roadmapData.findIndex(r => r.number === item.number);
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={item.number}
                      onClick={() => { setSelectedIdx(idx); setIsPlaying(false); }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110'
                          : 'bg-amber-950/40 border border-amber-900/40 text-amber-400 hover:bg-amber-900/20'
                      }`}
                    >
                      {item.number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Stage 1 (Product)</span>
              <div className="flex gap-2 flex-wrap">
                {roadmapData.filter(item => item.stage.includes('Stage 1')).map(item => {
                  const idx = roadmapData.findIndex(r => r.number === item.number);
                  const isSelected = selectedIdx === idx;
                  return (
                    <button
                      key={item.number}
                      onClick={() => { setSelectedIdx(idx); setIsPlaying(false); }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110'
                          : 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/20'
                      }`}
                    >
                      {item.number}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
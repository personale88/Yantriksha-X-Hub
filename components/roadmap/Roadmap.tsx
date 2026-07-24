'use client';

import { useState, useEffect } from 'react';

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
  isGate?: boolean;
}

const roadmapData: Milestone[] = [
  {
    number: "01",
    stage: "Stage -1: Confusion",
    title: "Problem Discovery",
    desc: "Identify high-impact, real-world pain points in society or industry. Sourced from industrial visits, community surveys, user observation, and SDG targets.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500",
    borderHoverColor: "hover:border-red-500/40",
    checklist: ["Identify challenge areas", "Conduct literature review", "Verify problem originality"],
    isGate: false
  },
  {
    number: "02",
    stage: "Stage -1: Confusion",
    title: "Team & Mentor Allocation",
    desc: "Assemble a compliant 10-member cross-disciplinary student team (Engineering, Law, Business) and assign Faculty, Industry, and Alumni mentors.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500",
    borderHoverColor: "hover:border-red-500/40",
    checklist: ["Form 10-member team", "Assign Faculty Mentor", "Assign Industry/Alumni Mentors"],
    isGate: false
  },
  {
    number: "03",
    stage: "Stage -1: Confusion",
    title: "Problem Validation",
    desc: "Validate the problem statement through customer discovery, user interviews, market research, and technical feasibility checks.",
    stageColor: "text-red-400",
    badgeColor: "bg-red-950/40 text-red-400 border-red-900/50",
    dotColor: "bg-red-500",
    borderHoverColor: "hover:border-red-500/40",
    checklist: ["Validate customer discovery", "Execute 5+ user interviews", "Draft validated problem statement"],
    isGate: false
  },
  {
    number: "QR1",
    stage: "Stage -1: Gate Checkpoint",
    title: "Quality Review – QR1 (Problem Assessment)",
    desc: "A rigorous review gate to determine whether the identified problem is worth solving before investing time and resources.",
    stageColor: "text-blue-400",
    badgeColor: "bg-blue-950/40 text-blue-300 border-blue-800/40",
    dotColor: "bg-blue-500",
    borderHoverColor: "hover:border-blue-500/40",
    checklist: ["Verify problem significance", "Assess customer need and urgency", "Confirm technical feasibility & documentation quality"],
    isGate: true
  },
  {
    number: "04",
    stage: "Stage 0: Idea",
    title: "Ideation & Research",
    desc: "Brainstorm solutions using design thinking. Perform prior-art patent searches and outline product architecture blueprints.",
    stageColor: "text-amber-400",
    badgeColor: "bg-amber-950/40 text-amber-400 border-amber-900/50",
    dotColor: "bg-amber-500",
    borderHoverColor: "hover:border-amber-500/40",
    checklist: ["Conduct patent prior-art searches", "Create electrical CAD schematics", "Draft product architecture vision"],
    isGate: false
  },
  {
    number: "QR2",
    stage: "Stage 0: Gate Checkpoint",
    title: "Quality Review – QR2 (Solution Assessment)",
    desc: "Evaluate whether the proposed solution is technically feasible, innovative, and aligned with user needs before prototype seed funding.",
    stageColor: "text-blue-400",
    badgeColor: "bg-blue-950/40 text-blue-300 border-blue-800/40",
    dotColor: "bg-blue-500",
    borderHoverColor: "hover:border-blue-500/40",
    checklist: ["Verify solution originality & innovation level", "Confirm alignment with validated user needs", "Approve for prototype seed funding"],
    isGate: true
  },
  {
    number: "05",
    stage: "Stage 0: Idea",
    title: "Funding & Resources",
    desc: "Secure prototype seed grants. Access campus makerspaces (AICTE IDEA Lab, Robotics/IoT/PCB labs) to procure components and start fabrication.",
    stageColor: "text-amber-400",
    badgeColor: "bg-amber-950/40 text-amber-400 border-amber-900/50",
    dotColor: "bg-amber-500",
    borderHoverColor: "hover:border-amber-500/40",
    checklist: ["Detail components bill of materials (BOM)", "Submit resource request to coordinators", "Access design & fabrication labs"],
    isGate: false
  },
  {
    number: "06",
    stage: "Stage 0: Idea",
    title: "Prototype Development & Testing",
    desc: "Build your Proof of Concept (PoC) / Minimum Viable Product (MVP). Perform internal testing, troubleshooting, and coding.",
    stageColor: "text-amber-400",
    badgeColor: "bg-amber-950/40 text-amber-400 border-amber-900/50",
    dotColor: "bg-amber-500",
    borderHoverColor: "hover:border-amber-500/40",
    checklist: ["Complete functional hardware assembly", "Write and flash micro-controller firmware", "Debug structural casings & test performance"],
    isGate: false
  },
  {
    number: "QR3",
    stage: "Stage 0: Gate Checkpoint",
    title: "Quality Review – QR3 (Prototype Assessment)",
    desc: "Assess whether the prototype is technically sound, reliable, and ready for external validation.",
    stageColor: "text-blue-400",
    badgeColor: "bg-blue-950/40 text-blue-300 border-blue-800/40",
    dotColor: "bg-blue-500",
    borderHoverColor: "hover:border-blue-500/40",
    checklist: ["Validate functional performance", "Verify structural engineering quality", "Pass electrical & mechanical safety checks"],
    isGate: true
  },
  {
    number: "07",
    stage: "Stage 1: Product",
    title: "Product Validation",
    desc: "Conduct user acceptance testing, field trials, pilot deployment, and customer feedback surveys to refine the product.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Launch pilot deployment under load", "Gather customer feedback metrics", "Formulate validation report dossier"],
    isGate: false
  },
  {
    number: "QR4",
    stage: "Stage 1: Gate Checkpoint",
    title: "Quality Review – QR4 (Product Readiness Review)",
    desc: "Verify that the product demonstrates sufficient novelty, execution quality, validation results, and commercial potential.",
    stageColor: "text-blue-400",
    badgeColor: "bg-blue-950/40 text-blue-300 border-blue-800/40",
    dotColor: "bg-blue-500",
    borderHoverColor: "hover:border-blue-500/40",
    checklist: ["Verify product novelty criteria", "Review user feedback data", "Confirm technical documentation completeness"],
    isGate: true
  },
  {
    number: "08",
    stage: "Stage 1: Product",
    title: "Research & IPR filing",
    desc: "Protect your intellectual property. Draft patents, submit provisional filings, or publish research papers in academic conferences.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Execute patent prior-art audits", "Draft and submit provisional patent application", "Prepare research abstract for publication"],
    isGate: false
  },
  {
    number: "09",
    stage: "Stage 1: Product",
    title: "Incubation (TBI Onboarding)",
    desc: "Get incubation support from the Technology Business Incubator (TBI). Register company, outline business models, and establish legal frameworks.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Onboard team into TBI incubator", "Draft startup registry profile", "Complete business model canvas (BMC) validation"],
    isGate: false
  },
  {
    number: "QR5",
    stage: "Stage 1: Gate Checkpoint",
    title: "Quality Review – QR5 (Startup Readiness Review)",
    desc: "Evaluate whether the innovation is ready to become a scalable startup before receiving scaling funding.",
    stageColor: "text-blue-400",
    badgeColor: "bg-blue-950/40 text-blue-300 border-blue-800/40",
    dotColor: "bg-blue-500",
    borderHoverColor: "hover:border-blue-500/40",
    checklist: ["Verify business model viability", "Verify team capability & roles", "Confirm market readiness and manufacturing plans"],
    isGate: true
  },
  {
    number: "10",
    stage: "Stage 1: Product",
    title: "Funding & Startup Scaling",
    desc: "Secure scaling capital (Startup India, AICTE, MSME, Venture Capitals, Angels) and scale production operations.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Pitch startup to venture capital funds", "Open commercial business bank account", "Set up bulk manufacturing facilities"],
    isGate: false
  },
  {
    number: "11",
    stage: "Stage 1: Product",
    title: "Commercialization & Impact",
    desc: "Officially launch your product to the market. Generate revenue, expand operations, and onboard alumni mentors.",
    stageColor: "text-emerald-400",
    badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-900/50",
    dotColor: "bg-emerald-500",
    borderHoverColor: "hover:border-emerald-500/40",
    checklist: ["Onboard first 100 paying customers", "Log early revenue generation streams", "Establish active alumni advisory mentoring feedback loops"],
    isGate: false
  }
];

// Coordinates along the winding S-curve road in a 400x1000 SVG viewport
const STOPS_COORDINATES = [
  { x: 80, y: 50, rot: 30 },     // Stop 1 (01)
  { x: 200, y: 110, rot: 15 },   // Stop 2 (02)
  { x: 320, y: 170, rot: 135 },  // Stop 3 (03)
  { x: 200, y: 230, rot: 165 },  // Stop 4 (QR1)
  { x: 80, y: 290, rot: 30 },    // Stop 5 (04)
  { x: 200, y: 350, rot: 15 },   // Stop 6 (QR2)
  { x: 320, y: 410, rot: 135 },  // Stop 7 (05)
  { x: 200, y: 470, rot: 165 },  // Stop 8 (06)
  { x: 80, y: 530, rot: 30 },    // Stop 9 (QR3)
  { x: 200, y: 590, rot: 15 },   // Stop 10 (07)
  { x: 320, y: 650, rot: 135 },  // Stop 11 (QR4)
  { x: 200, y: 710, rot: 165 },  // Stop 12 (08)
  { x: 80, y: 770, rot: 30 },    // Stop 13 (09)
  { x: 200, y: 830, rot: 15 },   // Stop 14 (QR5)
  { x: 320, y: 890, rot: 135 },  // Stop 15 (10)
  { x: 200, y: 950, rot: 90 }    // Stop 16 (11)
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
  } else if (activeMilestone.isGate) {
    carThemeColor = '#3b82f6';
    carGlowColor = 'rgba(59, 130, 246, 0.35)';
    carHeadlightColor = '#60a5fa';
    activeBorderGlow = 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
    activeStageText = 'text-blue-400';
  }

  return (
    <section id="roadmap" className="bg-slate-950 py-16 text-white relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: `
        .road-col { width: 145px !important; padding: 10px !important; }
        .road-track { width: 120px !important; height: 100% !important; min-height: 480px !important; }
        
        @media (min-width: 640px) {
          .road-col { width: 250px !important; padding: 16px !important; }
          .road-track { width: 210px !important; height: 100% !important; min-height: 560px !important; }
        }
        @media (min-width: 1024px) {
          .road-col { width: auto !important; padding: 24px !important; }
          .road-track { width: 400px !important; height: 100% !important; min-height: 560px !important; }
        }
      `}} />
      
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
            Click on any stop or Quality Review (QR) Gate along the winding highway to drive the Yantriksha rover to that checkpoint and reveal detailed parameters!
          </p>

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
          
          {/* LEFT COLUMN: The Winding Highway Track Map */}
          <div className="road-col lg:col-span-6 flex justify-center relative bg-slate-900/30 border border-slate-900/60 rounded-2xl sm:rounded-3xl backdrop-blur shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[40px] sm:blur-[70px] pointer-events-none" />

            <div className="road-track relative">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 1000"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0"
                preserveAspectRatio="none"
              >
                {/* 1. Glow border under the road */}
                <path
                  d="M 80,50 Q 200,80 200,110 Q 200,140 320,170 Q 200,200 200,230 Q 200,260 80,290 Q 200,320 200,350 Q 200,380 320,410 Q 200,440 200,470 Q 200,500 80,530 Q 200,560 200,590 Q 200,620 320,650 Q 200,680 200,710 Q 200,740 80,770 Q 200,800 200,830 Q 200,860 320,890 Q 200,920 200,950"
                  stroke="#3b82f6"
                  strokeWidth="28"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.1"
                />

                {/* 2. Asphalt Road Base */}
                <path
                  d="M 80,50 Q 200,80 200,110 Q 200,140 320,170 Q 200,200 200,230 Q 200,260 80,290 Q 200,320 200,350 Q 200,380 320,410 Q 200,440 200,470 Q 200,500 80,530 Q 200,560 200,590 Q 200,620 320,650 Q 200,680 200,710 Q 200,740 80,770 Q 200,800 200,830 Q 200,860 320,890 Q 200,920 200,950"
                  stroke="#1e293b"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Center Yellow Dashed Divider Lane */}
                <path
                  d="M 80,50 Q 200,80 200,110 Q 200,140 320,170 Q 200,200 200,230 Q 200,260 80,290 Q 200,320 200,350 Q 200,380 320,410 Q 200,440 200,470 Q 200,500 80,530 Q 200,560 200,590 Q 200,620 320,650 Q 200,680 200,710 Q 200,740 80,770 Q 200,800 200,830 Q 200,860 320,890 Q 200,920 200,950"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="6, 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
              </svg>

              {/* 4. Glowing Cyber Rover Car Absolute Overlay */}
              <div 
                className="absolute pointer-events-none z-20"
                style={{ 
                  left: `${(activeCoord.x / 400) * 100}%`, 
                  top: `${(activeCoord.y / 1000) * 100}%`,
                  width: '48px',
                  height: '28px',
                  marginLeft: '-24px',
                  marginTop: '-14px',
                  transform: `rotate(${activeCoord.rot}deg)`,
                  transition: 'left 0.9s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.9s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.9s ease'
                }}
              >
                <svg width="48" height="28" viewBox="-24 -14 48 28" fill="none">
                  <rect x="-24" y="-14" width="48" height="28" rx="8" fill={carGlowColor} filter="blur(4px)" style={{ transition: 'fill 0.5s ease' }} />
                  <rect x="-18" y="-10" width="36" height="20" rx="6" fill="#0f172a" stroke={carThemeColor} strokeWidth="2.5" style={{ transition: 'stroke 0.5s ease' }} />
                  <rect x="5" y="-7" width="9" height="14" rx="2" fill={carHeadlightColor} opacity="0.8" style={{ transition: 'fill 0.5s ease' }} />
                  <circle cx="16" cy="-5" r="2" fill={carHeadlightColor} style={{ transition: 'fill 0.5s ease' }} />
                  <circle cx="16" cy="5" r="2" fill={carHeadlightColor} style={{ transition: 'fill 0.5s ease' }} />
                  <path d="M -18 0 L -29 -4 L -25 0 L -29 4 Z" fill={carThemeColor} opacity="0.75" style={{ transition: 'fill 0.5s ease' }} />
                </svg>
              </div>

              {/* 5. Stops / Milestones Buttons */}
              {STOPS_COORDINATES.map((stop, idx) => {
                const milestone = roadmapData[idx];
                const isSelected = selectedIdx === idx;
                
                let stopGlow = 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]';
                if (milestone.isGate) {
                  stopGlow = 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,1)] border border-blue-300';
                } else if (milestone.stage.includes('Confusion')) {
                  stopGlow = 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]';
                } else if (milestone.stage.includes('Idea')) {
                  stopGlow = 'bg-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.8)]';
                } else {
                  stopGlow = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
                }

                const leftPercent = `${(stop.x / 400) * 100}%`;
                const topPercent = `${(stop.y / 1000) * 100}%`;

                return (
                  <button
                    key={idx}
                    onClick={() => { setSelectedIdx(idx); setIsPlaying(false); }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                    style={{ left: leftPercent, top: topPercent }}
                  >
                    {isSelected && (
                      <span className="absolute inset-[-5px] sm:inset-[-10px] rounded-full bg-blue-500/20 border border-blue-400/40 animate-ping pointer-events-none" />
                    )}

                    {milestone.isGate ? (
                      <div className={`relative h-8 w-8 sm:h-10 sm:w-10 border border-blue-500/50 rounded-xl flex items-center justify-center font-black transition duration-300 hover:scale-110 overflow-hidden bg-slate-950 ${
                        isSelected 
                          ? 'border-white shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                          : 'shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                      }`}>
                        {/* Winding Gate Doors */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1/2 bg-slate-900 border-r border-blue-500/60 transition-transform duration-500 ${
                          isSelected ? '-translate-x-[70%]' : 'translate-x-0'
                        }`} />
                        <div className={`absolute top-0 bottom-0 right-0 w-1/2 bg-slate-900 border-l border-blue-500/60 transition-transform duration-500 ${
                          isSelected ? 'translate-x-[70%]' : 'translate-x-0'
                        }`} />
                        {/* Laser / Scanner Line when closed */}
                        {!isSelected && (
                          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
                            <div className="w-[1px] h-full bg-blue-400 shadow-[0_0_6px_#60a5fa] animate-pulse" />
                          </div>
                        )}
                        {/* QR label */}
                        <span className="relative z-10 text-[7px] sm:text-[9px] font-black tracking-tighter text-blue-400">
                          {milestone.number}
                        </span>
                      </div>
                    ) : (
                      <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full border-[2px] sm:border-[3.5px] border-slate-950 flex items-center justify-center font-black transition duration-300 hover:scale-125 ${
                        isSelected 
                          ? 'bg-white text-slate-950 scale-110 shadow-[0_0_15px_#ffffff]'
                          : `${stopGlow} text-white`
                      }`}>
                        <span className="text-[8px] sm:text-[10px]">
                          {milestone.number}
                        </span>
                      </div>
                    )}

                    <div className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg">
                      {milestone.title}
                    </div>
                  </button>
                );
              })}

            </div>
          </div>

          {/* RIGHT COLUMN: The Interactive Milestone Control Dashboard */}
          <div className="flex-1 min-w-0 lg:col-span-6 space-y-4 lg:space-y-6">
            
            <div className="glass-card rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/10 min-h-[380px] sm:min-h-[480px] flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/5 rounded-full blur-[40px] pointer-events-none" />
              
              <div>
                
                {/* Header Tag info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-5 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-gray-500 font-bold text-[9px] sm:text-sm tracking-wider font-mono">
                      {activeMilestone.isGate ? 'CHECKPOINT GATE' : `STOP #${activeMilestone.number}`}
                    </span>
                    <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border uppercase tracking-wider ${
                      activeMilestone.isGate ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' : activeMilestone.badgeColor
                    }`}>
                      {activeMilestone.stage.split(': ')[1] || activeMilestone.stage}
                    </span>
                  </div>
                  <span className="text-[8px] sm:text-xs text-gray-500 font-bold">Incubation Phase</span>
                </div>

                {/* Gate Indicator Banner */}
                {activeMilestone.isGate && (
                  <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl px-3 py-2 mt-4 flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <span>🔐 Quality Review Gate Checkpoint</span>
                  </div>
                )}

                {/* Stop Title */}
                <h3 className="text-base sm:text-2xl font-black mt-3 sm:mt-6 tracking-tight text-white leading-tight">
                  {activeMilestone.title}
                </h3>

                {/* Stop Description */}
                <p className="text-gray-300 text-[10px] sm:text-sm mt-2 sm:mt-4 leading-relaxed font-light">
                  {activeMilestone.desc}
                </p>

                {/* Milestone Quest Checklist */}
                <div className="mt-4 sm:mt-6 bg-slate-950/60 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-800/80">
                  <h4 className="text-[9px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3.5">
                    {activeMilestone.isGate ? '📋 Review Criteria to Pass Gate:' : '📋 Checklist to Pass this Stop:'}
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2.5 text-[9px] sm:text-xs text-gray-400">
                    {activeMilestone.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 sm:gap-2.5 leading-relaxed">
                        <span className="text-blue-500 shrink-0">➢</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Join Incubation Club callout */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center bg-blue-600/5 border border-blue-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 gap-3 sm:gap-4 text-center sm:text-left">
                <div className="text-left">
                  <h4 className="font-bold text-[10px] sm:text-xs text-white">Ready to register your team?</h4>
                  <p className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-1 leading-normal">Onboard your project and clear the Quality Review (QR) Gates today!</p>
                </div>
                <a
                  href="/register"
                  className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] sm:text-xs px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg shadow-blue-900/30 hover:-translate-y-0.5 shrink-0"
                >
                  Join Hub Now →
                </a>
              </div>

            </div>

          </div>

        </div>

        {/* Stage Quick Jump Shortcuts */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-4 mt-8 sm:mt-12 w-full">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">
            🚀 Quick Jump Checkpoints by Phase
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
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                        item.isGate ? 'rounded-lg rotate-45 border border-blue-400' : ''
                      } ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110'
                          : 'bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/20'
                      }`}
                    >
                      <span className={item.isGate ? '-rotate-45' : ''}>{item.number}</span>
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
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                        item.isGate ? 'rounded-lg rotate-45 border border-blue-400' : ''
                      } ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110'
                          : 'bg-amber-950/40 border border-amber-900/40 text-amber-400 hover:bg-amber-900/20'
                      }`}
                    >
                      <span className={item.isGate ? '-rotate-45' : ''}>{item.number}</span>
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
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                        item.isGate ? 'rounded-lg rotate-45 border border-blue-400' : ''
                      } ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110'
                          : 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/20'
                      }`}
                    >
                      <span className={item.isGate ? '-rotate-45' : ''}>{item.number}</span>
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
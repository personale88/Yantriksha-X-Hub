'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface User {
  id: number;
  veltech_id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamCompliance {
  teamId: number;
  teamName: string;
  sector: string;
}

interface MilestoneProgress {
  milestone_key: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  attempt_number: number;
  time_taken: number;
  reviewer_name: string | null;
  review_date: string | null;
  review_comments: string | null;
  required_corrections: string | null;
  acknowledged: boolean;
}

interface JourneyState {
  current_stage: string;
  current_milestone: string;
  overall_progress: number;
  innovation_score: number;
  readiness_score: number;
  is_frozen: boolean;
  review_deadline: string | null;
}

interface ReviewHistory {
  milestone_key: string;
  reviewer_name: string;
  status: string;
  comments: string | null;
  required_corrections: string | null;
  attempt_number: number;
  created_at: string;
}

interface JourneyNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const DASHBOARD_COORDINATES: Record<string, { x: number; y: number; label: string; number: string; icon: string; isGate?: boolean }> = {
  'stg_-1_prob_disc': { x: 100, y: 50, label: 'Problem Discovery', number: '01', icon: '🔍' },
  'stg_-1_team_alloc': { x: 200, y: 110, label: 'Team & Mentor Allocation', number: '02', icon: '👥' },
  'stg_-1_prob_val': { x: 300, y: 170, label: 'Problem Validation', number: '03', icon: '📊' },
  'qr1': { x: 200, y: 230, label: 'Quality Review – QR1 (Problem Assessment)', number: 'QR1', icon: '🔐', isGate: true },
  'stg_0_ideation': { x: 100, y: 290, label: 'Ideation & Research', number: '04', icon: '💡' },
  'qr2': { x: 200, y: 350, label: 'Quality Review – QR2 (Solution Assessment)', number: 'QR2', icon: '🔐', isGate: true },
  'stg_0_funding': { x: 300, y: 410, label: 'Funding & Resources', number: '05', icon: '💰' },
  'stg_0_proto_dev': { x: 200, y: 470, label: 'Prototype Development & Testing', number: '06', icon: '🛠️' },
  'qr3': { x: 100, y: 530, label: 'Quality Review – QR3 (Prototype Assessment)', number: 'QR3', icon: '🔐', isGate: true },
  'stg_1_prod_val': { x: 200, y: 590, label: 'Product Validation', number: '07', icon: '🧪' },
  'qr4': { x: 300, y: 650, label: 'Quality Review – QR4 (Product Readiness Review)', number: 'QR4', icon: '🔐', isGate: true },
  'stg_1_branch_pub': { x: 130, y: 720, label: 'Research Publication', number: '08A', icon: '📚' },
  'stg_1_branch_pat': { x: 270, y: 720, label: 'Patent & IPR', number: '08B', icon: '📄' },
  'stg_1_incubation': { x: 200, y: 800, label: 'Incubation (TBI Onboarding)', number: '09', icon: '🏢' },
  'qr5': { x: 100, y: 870, label: 'Quality Review – QR5 (Startup Readiness Review)', number: 'QR5', icon: '🔐', isGate: true },
  'stg_1_scaling': { x: 200, y: 930, label: 'Funding & Startup Scaling', number: '10', icon: '🚀' },
  'stg_1_impact': { x: 300, y: 990, label: 'Commercialization & Impact', number: '11', icon: '🌍' }
};

const INTRINSIC_STYLES = `
  @keyframes robot-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-6px) rotate(1deg); }
  }
  @keyframes robot-walk {
    0%, 100% { transform: translateY(0) rotate(0deg) scaleX(1); }
    25% { transform: translateY(-4px) rotate(4deg) scaleX(1.02); }
    50% { transform: translateY(0) rotate(-2deg) scaleX(0.98); }
    75% { transform: translateY(-4px) rotate(4deg) scaleX(1.02); }
  }
  @keyframes robot-sleep {
    0%, 100% { transform: translateY(3px) scaleY(0.95); opacity: 0.95; }
    50% { transform: translateY(5px) scaleY(0.92); opacity: 0.85; }
  }
  @keyframes robot-sad {
    0%, 100% { transform: translateY(1px) rotate(-3deg); }
    50% { transform: translateY(4px) rotate(3deg); }
  }
  @keyframes robot-spin-jump {
    0% { transform: translateY(0) scale(1); }
    20% { transform: translateY(3px) scaleY(0.85); }
    40% { transform: translateY(-20px) scaleY(1.1) rotate(180deg); }
    60% { transform: translateY(-20px) rotate(360deg); }
    80% { transform: translateY(0) scaleY(0.95); }
    100% { transform: translateY(0) scale(1); }
  }
  @keyframes gate-scan {
    0%, 100% { top: 0%; opacity: 0.2; }
    50% { top: 100%; opacity: 0.8; }
  }
  @keyframes scanner-sweep {
    0%, 100% { left: 0%; }
    50% { left: 80%; }
  }
  @keyframes zzz-anim {
    0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
    30% { opacity: 0.8; }
    100% { transform: translate(10px, -22px) scale(1.1); opacity: 0; }
  }
  .animate-float { animation: robot-float 3s ease-in-out infinite; }
  .animate-robot-walk { animation: robot-walk 0.6s ease-in-out infinite; }
  .animate-robot-sleep { animation: robot-sleep 4s ease-in-out infinite; }
  .animate-robot-sad { animation: robot-sad 3s ease-in-out infinite; }
  .animate-robot-spin-jump { animation: robot-spin-jump 1.2s ease-in-out infinite; }
  .animate-gate-scan { animation: gate-scan 2s linear infinite; }
  .animate-scanner-sweep { animation: scanner-sweep 1.5s ease-in-out infinite; }
  .animate-zzz-slow { animation: zzz-anim 3s ease-in-out infinite; }
  
  @keyframes wave-l {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-25deg); }
  }
  @keyframes wave-r {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(25deg); }
  }
  .animate-wave-left { animation: wave-l 0.8s ease-in-out infinite; }
  .animate-wave-right { animation: wave-r 0.8s ease-in-out infinite; }

  @keyframes firework-bloom {
    0% { transform: scale(0.1); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: scale(1.5) translate(var(--tw-x, 0), var(--tw-y, 0)); opacity: 0; }
  }
  .animate-firework {
    animation: firework-bloom 1.5s ease-out infinite;
  }
`;

function RobotAvatar({ state }: { state: 'idle' | 'walk' | 'sleep' | 'work' | 'disappointed' | 'celebrate' }) {
  let eyeColor = 'fill-blue-400 drop-shadow-[0_0_4px_rgba(96,165,250,0.8)]';
  if (state === 'sleep') eyeColor = 'fill-slate-600';
  if (state === 'disappointed') eyeColor = 'fill-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.7)]';
  if (state === 'celebrate') eyeColor = 'fill-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]';

  let robotClass = 'animate-float';
  if (state === 'walk') robotClass = 'animate-robot-walk';
  if (state === 'sleep') robotClass = 'animate-robot-sleep';
  if (state === 'disappointed') robotClass = 'animate-robot-sad';
  if (state === 'celebrate') robotClass = 'animate-robot-spin-jump';

  return (
    <div className={`relative w-16 h-16 transition-all duration-500 ${robotClass}`}>
      {state === 'sleep' && (
        <div className="absolute -top-6 -right-2 pointer-events-none font-black text-blue-400 text-xs select-none">
          <span className="absolute animate-zzz-slow" style={{ animationDelay: '0s' }}>Z</span>
          <span className="absolute animate-zzz-slow ml-2 mt-[-4px] text-[10px]" style={{ animationDelay: '1s' }}>z</span>
          <span className="absolute animate-zzz-slow ml-4 mt-[-8px] text-[8px]" style={{ animationDelay: '2s' }}>z</span>
        </div>
      )}
      
      {state === 'work' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-12 h-6 bg-cyan-500/20 border border-cyan-400/40 rounded-md backdrop-blur-sm pointer-events-none animate-pulse flex items-center justify-center">
          <div className="w-10 h-0.5 bg-cyan-400/60 animate-scanner-sweep" />
          <span className="text-[6px] text-cyan-200 font-mono scale-75 uppercase">Data Log</span>
        </div>
      )}

      <svg viewBox="0 0 64 64" className="w-full h-full">
        <line x1="32" y1="12" x2="32" y2="6" stroke="#475569" strokeWidth="2" />
        <circle cx="32" cy="5" r="3" className={
          state === 'sleep' ? 'fill-slate-600' :
          state === 'disappointed' ? 'fill-red-500 animate-pulse' :
          state === 'celebrate' ? 'fill-emerald-400 animate-ping' : 'fill-blue-400'
        } />
        
        <rect x="18" y="12" width="28" height="20" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="22" y="16" width="20" height="8" rx="2" fill="#0f172a" />
        
        {state === 'sleep' ? (
          <line x1="24" y1="20" x2="28" y2="20" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        ) : state === 'disappointed' ? (
          <path d="M24,22 L28,18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <circle cx="26" cy="20" r="2.5" className={eyeColor} />
        )}

        {state === 'sleep' ? (
          <line x1="36" y1="20" x2="40" y2="20" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        ) : state === 'disappointed' ? (
          <path d="M36,22 L40,18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <circle cx="38" cy="20" r="2.5" className={eyeColor} />
        )}

        <line x1="28" y1="27" x2="36" y2="27" stroke={state === 'disappointed' ? '#ef4444' : '#60a5fa'} strokeWidth="1.5" strokeLinecap="round" />
        
        <rect x="29" y="32" width="6" height="3" fill="#475569" />
        
        <path d="M20,35 H44 L40,52 H24 Z" fill="#334155" stroke="#475569" strokeWidth="2" />
        <circle cx="32" cy="43" r="4" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
        
        {state === 'celebrate' ? (
          <path d="M20,38 Q10,30 14,24" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" className="origin-right animate-wave-left" />
        ) : state === 'disappointed' ? (
          <path d="M20,38 Q14,48 16,52" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M20,38 Q12,42 16,48" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}

        {state === 'celebrate' ? (
          <path d="M44,38 Q54,30 50,24" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" className="origin-left animate-wave-right" />
        ) : state === 'disappointed' ? (
          <path d="M44,38 Q50,48 48,52" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M44,38 Q52,42 48,48" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}

        <ellipse cx="32" cy="56" rx="10" ry="2" fill="#475569" />
        <path d="M28,57 L32,62 L36,57 Z" className={
          state === 'sleep' ? 'fill-slate-600' :
          state === 'disappointed' ? 'fill-red-900' : 'fill-cyan-400 animate-pulse'
        } />
      </svg>
    </div>
  );
}

function FuturisticGate({ status }: { status: string }) {
  let gateColor = 'border-slate-800 bg-slate-950/80';
  let beamClass = 'hidden';
  let leftDoorTransform = '';
  let rightDoorTransform = '';
  let neonGlow = '';

  if (status === 'completed' || status === 'approved') {
    gateColor = 'border-emerald-500 bg-emerald-950/10';
    leftDoorTransform = 'translate-x-[-120%]';
    rightDoorTransform = 'translate-x-[120%]';
    neonGlow = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  } else if (status === 'waiting_for_review') {
    gateColor = 'border-blue-500 bg-blue-950/20 animate-pulse';
    beamClass = 'absolute inset-x-0 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)] animate-gate-scan';
    neonGlow = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
  } else if (status === 'rejected') {
    gateColor = 'border-red-500 bg-red-950/20';
    neonGlow = 'shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse';
  } else if (status === 'locked') {
    gateColor = 'border-slate-900 bg-slate-950/90';
    neonGlow = 'opacity-40';
  } else {
    gateColor = 'border-amber-500 bg-amber-950/10';
    neonGlow = 'shadow-[0_0_10px_rgba(245,158,11,0.3)]';
  }

  return (
    <div className={`relative w-12 h-12 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all duration-700 ${gateColor} ${neonGlow}`}>
      <div className={beamClass} />
      
      {(status !== 'completed' && status !== 'approved') && (
        <div className="absolute inset-0 bg-space-grid opacity-25 pointer-events-none" />
      )}

      <div className="absolute inset-0 flex">
        <div className={`w-1/2 h-full bg-slate-900 border-r border-slate-700 transition-transform duration-700 ${leftDoorTransform}`} />
        <div className={`w-1/2 h-full bg-slate-900 border-l border-slate-700 transition-transform duration-700 ${rightDoorTransform}`} />
      </div>

      <div className="absolute z-10 flex flex-col items-center justify-center scale-90">
        {status === 'completed' || status === 'approved' ? (
          <span className="text-emerald-400 text-base drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]">🔓</span>
        ) : status === 'waiting_for_review' ? (
          <span className="text-blue-400 text-[8px] font-black animate-pulse">SCAN</span>
        ) : status === 'rejected' ? (
          <span className="text-red-400 text-base animate-bounce">⚠️</span>
        ) : (
          <span className="text-gray-500 text-base">🔒</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardJourney({
  user,
  team,
  onRefresh
}: {
  user: User;
  team: TeamCompliance | null;
  onRefresh?: () => void;
}) {
  const [journey, setJourney] = useState<JourneyState | null>(null);
  const [progress, setProgress] = useState<MilestoneProgress[]>([]);
  const [notifications, setNotifications] = useState<JourneyNotification[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistory[]>([]);
  const [milestonesConfig, setMilestonesConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>('stg_-1_prob_disc');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form input states
  const [reportContent, setReportContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // Confetti overlay trigger
  const [showConfetti, setShowConfetti] = useState(false);
  const [robotState, setRobotState] = useState<'idle' | 'walk' | 'sleep' | 'work' | 'disappointed' | 'celebrate'>('idle');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchJourney();
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvents(data.events || []);
        }
      })
      .catch(err => console.error('Failed to fetch events:', err));
  }, []);

  // Update robot state automatically based on milestone focus changes
  useEffect(() => {
    setRobotState('walk');
    const timer = setTimeout(() => {
      const milestone = progress.find(p => p.milestone_key === selectedKey);
      const status = milestone?.status || 'locked';
      if (status === 'completed' || status === 'approved') {
        setRobotState('celebrate');
      } else if (status === 'waiting_for_review') {
        setRobotState('sleep');
      } else if (status === 'rejected') {
        setRobotState('disappointed');
      } else if (status === 'in_progress') {
        setRobotState('work');
      } else {
        setRobotState('idle');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [selectedKey, progress]);

  const fetchJourney = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/innovation-journey');
      const data = await res.json();
      if (data.success) {
        setJourney(data.journey);
        setProgress(data.progress || []);
        setNotifications(data.notifications || []);
        setReviewHistory(data.reviewHistory || []);
        setMilestonesConfig(data.milestonesConfig || []);
        
        if (data.journey?.current_milestone) {
          setSelectedKey(data.journey.current_milestone);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load your innovation journey.');
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneAction = async (action: 'start' | 'submit' | 'acknowledge') => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/innovation-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          milestoneKey: selectedKey
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update milestone status');

      if (action === 'submit') {
        setSuccessMsg(data.status === 'completed' 
          ? 'Milestone completed successfully!' 
          : 'Milestone submitted for reviewer evaluation!'
        );
        if (data.status === 'completed') {
          triggerConfettiEffect();
        }
      } else if (action === 'start') {
        setSuccessMsg('Milestone started! Review the checklist to complete tasks.');
      } else if (action === 'acknowledge') {
        setSuccessMsg('Corrections acknowledged. You can now re-submit your report.');
      }

      setReportContent('');
      setFileUrl('');
      await fetchJourney();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const triggerConfettiEffect = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <span className="text-4xl animate-spin">🌀</span>
        <p className="text-gray-400 text-sm">Synchronizing your innovation metrics...</p>
      </div>
    );
  }

  const completedCount = progress.filter(p => p.status === 'completed' || p.status === 'approved').length;
  const activeConfig = milestonesConfig.find(m => m.key === selectedKey);

  const currentKey = journey?.current_milestone || 'stg_-1_prob_disc';
  const roverCoord = DASHBOARD_COORDINATES[currentKey] || { x: 100, y: 50 };

  let pathGlow = 'rgba(59, 130, 246, 0.2)';
  if (currentKey.includes('stg_-1')) {
    pathGlow = 'rgba(239, 68, 68, 0.25)';
  } else if (currentKey.includes('stg_0')) {
    pathGlow = 'rgba(245, 158, 11, 0.25)';
  } else if (currentKey.includes('stg_1')) {
    pathGlow = 'rgba(16, 185, 129, 0.25)';
  }

  // XP & Level calculations
  const totalXP = journey?.innovation_score || 0;
  let level = 1;
  let levelTitle = 'Innovator';
  let levelMin = 0;
  let levelMax = 300;
  
  if (totalXP >= 4000) {
    level = 5;
    levelTitle = 'Founder';
    levelMin = 4000;
    levelMax = 6350;
  } else if (totalXP >= 2000) {
    level = 4;
    levelTitle = 'Creator';
    levelMin = 2000;
    levelMax = 4000;
  } else if (totalXP >= 900) {
    level = 3;
    levelTitle = 'Builder';
    levelMin = 900;
    levelMax = 2000;
  } else if (totalXP >= 300) {
    level = 2;
    levelTitle = 'Researcher';
    levelMin = 300;
    levelMax = 900;
  }

  const levelXPProgress = totalXP - levelMin;
  const levelXPRequired = levelMax - levelMin;
  const levelPercent = Math.min(100, Math.floor((levelXPProgress / levelXPRequired) * 100));

  // Badges array
  const badges = [
    { 
      id: 'explorer', 
      title: 'Problem Explorer', 
      desc: 'Verify a significant real-world problem and obtain QR1 approval.', 
      icon: '🔍', 
      unlocked: progress.find(p => p.milestone_key === 'qr1')?.status === 'completed' || progress.find(p => p.milestone_key === 'qr1')?.status === 'approved'
    },
    { 
      id: 'warrior', 
      title: 'Research Warrior', 
      desc: 'Formulate solution concepts and log publication prior-art indexing.', 
      icon: '📚', 
      unlocked: progress.find(p => p.milestone_key === 'stg_0_ideation')?.status === 'completed'
    },
    { 
      id: 'builder', 
      title: 'Prototype Builder', 
      desc: 'Construct a fully functional proof-of-concept prototype and pass QR3.', 
      icon: '🛠️', 
      unlocked: progress.find(p => p.milestone_key === 'qr3')?.status === 'completed' || progress.find(p => p.milestone_key === 'qr3')?.status === 'approved'
    },
    { 
      id: 'creator', 
      title: 'Patent Creator', 
      desc: 'Complete legal patent filing specification with Law school mentors.', 
      icon: '📄', 
      unlocked: progress.find(p => p.milestone_key === 'stg_1_branch_pat')?.status === 'completed'
    },
    { 
      id: 'founder', 
      title: 'Startup Founder', 
      desc: 'Incorporate active start-up and gain workspace incubation at TBI.', 
      icon: '🏢', 
      unlocked: progress.find(p => p.milestone_key === 'qr5')?.status === 'completed' || progress.find(p => p.milestone_key === 'qr5')?.status === 'approved'
    },
    { 
      id: 'maker', 
      title: 'Impact Maker', 
      desc: 'Deploy commercial operations and track live customer revenue transactions.', 
      icon: '🌍', 
      unlocked: progress.find(p => p.milestone_key === 'stg_1_impact')?.status === 'completed'
    }
  ];

  const currentClearedStageBadge = badges.find(b => b.unlocked);

  const activeMilestone = progress.find(p => p.milestone_key === selectedKey);

  const getAssociatedEvents = () => {
    if (!events.length || !activeConfig) return [];
    const stage = activeConfig.stage?.toLowerCase() || '';
    const isGate = activeConfig.isGate;

    return events.filter(e => {
      const category = (e.category || '').toLowerCase();
      const eventTitle = (e.title || '').toLowerCase();

      if (isGate) {
        return category.includes('review') || category.includes('evaluation') || eventTitle.includes('review') || eventTitle.includes('qr');
      }
      if (stage.includes('confusion')) {
        return category.includes('bootcamp') || category.includes('orientation') || category.includes('seminar') || eventTitle.includes('bootcamp');
      }
      if (stage.includes('idea')) {
        return category.includes('ideathon') || category.includes('workshop') || eventTitle.includes('idea') || eventTitle.includes('concept');
      }
      if (stage.includes('product') || stage.includes('prototype')) {
        return category.includes('hackathon') || category.includes('demo') || category.includes('dev') || eventTitle.includes('hackathon') || eventTitle.includes('prototype');
      }
      return false;
    });
  };

  const associatedEvents = getAssociatedEvents();

  return (
    <div className="space-y-8 animate-fadeIn relative">
      <style dangerouslySetInnerHTML={{ __html: INTRINSIC_STYLES }} />
      
      {/* Confetti & Stage Cleared Modal Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-slate-950/40 backdrop-blur-sm">
          <div className="relative bg-slate-950/95 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl backdrop-blur max-w-sm animate-bounce flex flex-col items-center">
            
            {/* Visual fireworks blooms */}
            <div className="absolute top-2 left-6 w-3 h-3 bg-red-400 rounded-full animate-firework pointer-events-none" style={{ '--tw-x': '-30px', '--tw-y': '-30px' } as any} />
            <div className="absolute top-4 right-8 w-2 h-2 bg-blue-400 rounded-full animate-firework pointer-events-none" style={{ '--tw-x': '40px', '--tw-y': '-20px', animationDelay: '0.3s' } as any} />
            <div className="absolute bottom-8 left-12 w-4 h-4 bg-yellow-400 rounded-full animate-firework pointer-events-none" style={{ '--tw-x': '-40px', '--tw-y': '25px', animationDelay: '0.6s' } as any} />

            <span className="text-6xl animate-pulse">🎉</span>
            <h3 className="text-2xl font-black text-white mt-4 tracking-tight">Stage Cleared!</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Your innovation milestone has been verified. The next checkpoint on the map is now unlocked!
            </p>
            {currentClearedStageBadge && (
              <div className="mt-5 p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 w-full">
                <span className="text-3xl">{currentClearedStageBadge.icon}</span>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Achievement Unlocked</span>
                  <span className="text-xs font-bold text-white block">{currentClearedStageBadge.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge detail interactive modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center relative space-y-4" onClick={e => e.stopPropagation()}>
            <span className="text-6xl block">{selectedBadge.icon}</span>
            <h3 className="text-xl font-black text-white">{selectedBadge.title}</h3>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              selectedBadge.unlocked ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40' : 'bg-slate-950 text-gray-500 border border-slate-800'
            }`}>
              {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
            </span>
            <p className="text-xs text-gray-400 leading-relaxed font-light">{selectedBadge.desc}</p>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-750 text-white font-bold text-xs py-2.5 rounded-xl transition mt-4"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="section-pill">✦ Gamified Incubation Console</span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            My Innovation Journey
            {journey?.is_frozen && <span className="bg-red-950/60 text-red-400 border border-red-900/50 text-[10px] uppercase px-2.5 py-0.5 rounded-full font-black animate-pulse">Frozen</span>}
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-xl">
            Pass Quality Review Gates, submit artifacts, and drive your robot avatar to the final destination: commercial impact!
          </p>
        </div>
        
        {journey?.review_deadline && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shrink-0 flex items-center gap-3">
            <span className="text-2xl animate-pulse">⏳</span>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Review Deadline</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{new Date(journey.review_deadline).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* LEVEL & XP PROGRESS HUD */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900/80 to-blue-950/10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
            <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider leading-none">LVL</span>
            <span className="text-3xl font-extrabold text-white leading-none mt-1">{level}</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{levelTitle}</h3>
            <p className="text-xs text-gray-500">Earned a total of <span className="font-bold text-gray-400">{totalXP} XP</span> on your roadmap</p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-400">{levelXPProgress} / {levelXPRequired} XP</span>
            <span className="text-blue-400">Level {level + 1} at {levelMax} XP</span>
          </div>
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-900 p-0.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-amber-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gamification Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-25">🗺️</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Stage</h3>
          <p className="mt-3 text-lg font-black text-white">{journey?.current_stage}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-25">🏆</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Innovation Score</h3>
          <p className="mt-3 text-3xl font-extrabold text-blue-400">{totalXP} <span className="text-xs text-gray-500 font-bold">pts</span></p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-25">🎯</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Readiness Score</h3>
          <p className="mt-3 text-3xl font-extrabold text-amber-400">{journey?.readiness_score || 0}%</p>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-25">⚡</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Progress</h3>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-3xl font-extrabold text-emerald-400">{journey?.overall_progress || 0}%</p>
            <div className="flex-1 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${journey?.overall_progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-800/60 text-red-400 rounded-2xl text-xs flex items-center gap-2.5">
          <span>❌</span> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-2xl text-xs flex items-center gap-2.5">
          <span>🎉</span> {successMsg}
        </div>
      )}

      {/* Split Interactive Viewport */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* Left Side: Winding S-Curve Journey Map */}
        <div className="w-full lg:w-[450px] shrink-0 bg-slate-900/30 border border-slate-900/60 rounded-3xl p-6 relative flex justify-center backdrop-blur overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[70px] pointer-events-none" />

          {/* SVG Road and Winding Track */}
          <div className="relative w-full max-w-[360px] h-[1050px] shrink-0">
            
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 1050"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
              preserveAspectRatio="none"
            >
              <path
                d="M 100,50 Q 150,80 200,110 Q 250,140 300,170 Q 250,200 200,230 Q 150,260 100,290 Q 150,320 200,350 Q 250,380 300,410 Q 250,440 200,470 Q 150,500 100,530 Q 150,560 200,590 Q 250,620 300,650 M 300,650 Q 215,685 130,720 Q 165,760 200,800 M 300,650 Q 285,685 270,720 Q 235,760 200,800 M 200,800 Q 150,835 100,870 Q 150,900 200,930 Q 250,960 300,990"
                stroke="#3b82f6"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.1"
              />

              <path
                d="M 100,50 Q 150,80 200,110 Q 250,140 300,170 Q 250,200 200,230 Q 150,260 100,290 Q 150,320 200,350 Q 250,380 300,410 Q 250,440 200,470 Q 150,500 100,530 Q 150,560 200,590 Q 250,620 300,650 M 300,650 Q 215,685 130,720 Q 165,760 200,800 M 300,650 Q 285,685 270,720 Q 235,760 200,800 M 200,800 Q 150,835 100,870 Q 150,900 200,930 Q 250,960 300,990"
                stroke="#1e293b"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M 100,50 Q 150,80 200,110 Q 250,140 300,170 Q 250,200 200,230 Q 150,260 100,290 Q 150,320 200,350 Q 250,380 300,410 Q 250,440 200,470 Q 150,500 100,530 Q 150,560 200,590 Q 250,620 300,650 M 300,650 Q 215,685 130,720 Q 165,760 200,800 M 300,650 Q 285,685 270,720 Q 235,760 200,800 M 200,800 Q 150,835 100,870 Q 150,900 200,930 Q 250,960 300,990"
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeDasharray="6, 8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>

            {/* Robot companion floating overlay */}
            <div
              className="absolute pointer-events-none z-30 transition-all duration-[1200ms] ease-in-out"
              style={{
                left: `${(roverCoord.x / 400) * 100}%`,
                top: `${roverCoord.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative flex flex-col items-center">
                <div 
                  className="absolute -inset-3 rounded-full blur-md animate-pulse" 
                  style={{ backgroundColor: pathGlow }}
                />
                
                <RobotAvatar state={robotState} />
                
                <span className="text-[9px] font-black uppercase text-blue-400 bg-slate-950/95 border border-slate-800/80 px-2.5 py-0.5 rounded-full mt-1.5 shadow-lg whitespace-nowrap">
                  Companion
                </span>
              </div>
            </div>

            {/* Interactive stops / checkpoints */}
            {Object.entries(DASHBOARD_COORDINATES).map(([key, coord]) => {
              const milestone = progress.find(p => p.milestone_key === key);
              const status = milestone?.status || 'locked';
              const isSelected = selectedKey === key;
              
              let statusBg = 'bg-slate-950 border-slate-800 text-gray-500';
              let ringPulse = false;

              if (status === 'completed' || status === 'approved') {
                statusBg = 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.8)]';
              } else if (status === 'waiting_for_review') {
                statusBg = 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.8)]';
                ringPulse = true;
              } else if (status === 'rejected') {
                statusBg = 'bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse';
                ringPulse = true;
              } else if (status === 'in_progress') {
                statusBg = 'bg-amber-600 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.8)]';
                ringPulse = true;
              } else if (status === 'available') {
                statusBg = 'bg-slate-800 border-slate-700 text-gray-300';
              }

              const leftPct = `${(coord.x / 400) * 100}%`;
              const topVal = `${coord.y}px`;

              return (
                <button
                  key={key}
                  onClick={() => { setSelectedKey(key); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-all duration-300 hover:scale-125 outline-none`}
                  style={{ left: leftPct, top: topVal }}
                >
                  {ringPulse && (
                    <span className="absolute inset-[-6px] sm:inset-[-8px] rounded-full bg-blue-500/10 border border-blue-400/25 animate-ping pointer-events-none" />
                  )}

                  {coord.isGate ? (
                    <div className={`transition-all duration-300 ${isSelected ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,1)]' : ''}`}>
                      <FuturisticGate status={status} />
                    </div>
                  ) : (
                    <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border-[2.5px] flex items-center justify-center font-bold text-[8px] sm:text-[9px] transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white border-white text-slate-950 scale-110 shadow-[0_0_15px_rgba(255,255,255,1)]'
                        : statusBg
                    }`}>
                      <span>
                        {coord.number}
                      </span>
                    </div>
                  )}

                  <div className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[8px] text-white font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg">
                    {coord.label}
                  </div>
                </button>
              );
            })}

          </div>

        </div>

        {/* Right Side: Interactive Milestone Action Console & Badges */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          
          {/* Active Milestone Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/10 min-h-[460px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/5 rounded-full blur-[40px] pointer-events-none" />
            
            {activeConfig ? (
              <div>
                
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">{coordIcon(selectedKey)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      activeConfig.isGate ? 'bg-blue-950/60 text-blue-300 border-blue-800/60' : 'bg-slate-900 text-gray-400 border-slate-800'
                    }`}>
                      {activeConfig.stage}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {statusLabelBadge(activeMilestone?.status || 'locked')}
                  </div>
                </div>

                {activeConfig.isGate && (
                  <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl px-4 py-2.5 mt-4 flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <span>🔐 Quality Review Gate Checkpoint</span>
                  </div>
                )}

                {activeMilestone?.status === 'rejected' && (
                  <div className="bg-red-950/40 border border-red-900/30 rounded-2xl p-4 mt-4 space-y-2">
                    <span className="text-red-400 font-extrabold text-xs block">⚠️ Revision Required:</span>
                    <p className="text-[11px] text-gray-300 italic leading-relaxed">
                      "{activeMilestone.review_comments || 'Requires corrections.'}"
                    </p>
                    {activeMilestone.required_corrections && (
                      <p className="text-[11px] text-gray-400 leading-normal font-light">
                        <span className="font-bold text-gray-300">Required changes:</span> {activeMilestone.required_corrections}
                      </p>
                    )}
                    <span className="text-[10px] text-gray-500 block">
                      Evaluated by: <span className="text-gray-300">{activeMilestone.reviewer_name}</span> | Date: {activeMilestone.review_date ? new Date(activeMilestone.review_date).toLocaleDateString() : ''}
                    </span>
                    
                    {!activeMilestone.acknowledged && (
                      <button
                        onClick={() => handleMilestoneAction('acknowledge')}
                        disabled={actionLoading}
                        className="mt-2 bg-red-900/60 hover:bg-red-800/80 text-red-300 border border-red-800/40 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Acknowledge & Edit Milestone
                      </button>
                    )}
                  </div>
                )}

                <h3 className="text-xl sm:text-2xl font-black mt-5 tracking-tight text-white leading-tight">
                  {activeConfig.title}
                </h3>
                <p className="text-gray-400 text-xs mt-2.5 leading-relaxed font-light">
                  {activeConfig.desc}
                </p>

                <div className="mt-6 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">
                    {activeConfig.isGate ? '📋 Review Criteria to Pass Gate:' : '📋 Milestone Checklist Tasks:'}
                  </h4>
                  <ul className="space-y-2.5 text-xs text-gray-400">
                    {milestoneChecklist(selectedKey).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-500 shrink-0 mt-0.5">➢</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Associated Events Block */}
                {associatedEvents.length > 0 && (
                  <div className="mt-6 bg-blue-950/20 border border-blue-500/10 rounded-2xl p-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 text-blue-400">
                      <span>📅</span> Associated Upcoming Events
                    </h4>
                    <div className="space-y-3">
                      {associatedEvents.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="bg-slate-950/50 border border-slate-900 rounded-xl p-3 flex justify-between items-center hover:border-slate-800/80 transition duration-200">
                          <div>
                            <h5 className="text-xs font-bold text-white leading-snug">{event.title}</h5>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-900/30 animate-pulse shrink-0">
                            {event.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  {activeMilestone?.status === 'available' && (
                    <button
                      onClick={() => handleMilestoneAction('start')}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs py-3 rounded-xl transition duration-200"
                    >
                      🏁 Start Milestone
                    </button>
                  )}

                  {activeMilestone?.status === 'in_progress' && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleMilestoneAction('submit');
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Submission Details / Artifact description
                        </label>
                        <textarea
                          value={reportContent}
                          onChange={e => setReportContent(e.target.value)}
                          placeholder="Provide details about the completed tasks..."
                          rows={3}
                          className="w-full p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-white text-xs outline-none focus:border-blue-500/80 placeholder-slate-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Deliverable Link (Drive / GitHub / PDF)
                        </label>
                        <input
                          type="url"
                          value={fileUrl}
                          onChange={e => setFileUrl(e.target.value)}
                          placeholder="https://google-drive-link-or-github..."
                          className="w-full p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-white text-xs outline-none focus:border-blue-500/80 placeholder-slate-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-xl transition"
                      >
                        📤 Submit for Review
                      </button>
                    </form>
                  )}

                  {activeMilestone?.status === 'waiting_for_review' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Waiting for Reviewer Evaluation
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 italic text-center">
                        Our panel is verifying your deliverables. Your companion robot is currently sleeping/charging.
                      </p>
                    </div>
                  )}

                  {activeMilestone?.status === 'locked' && (
                    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 text-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        🔒 Checkpoint Locked (Complete previous steps first)
                      </span>
                    </div>
                  )}

                  {(activeMilestone?.status === 'completed' || activeMilestone?.status === 'approved') && (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex items-center justify-center gap-2">
                      <span className="text-emerald-400">✔</span>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Milestone Completed & Verified
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Select a milestone on the roadmap to display details.</p>
              </div>
            )}

            <div className="mt-8 border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
              <div>
                <h4 className="text-[11px] font-bold text-white">Progressing toward Incubator status?</h4>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-normal">Build compliance, pass all gates, and request prototype funding!</p>
              </div>
              {team && (
                <div className="text-xs font-bold text-blue-400 bg-blue-950/40 border border-blue-900/50 px-3 py-1 rounded-full uppercase tracking-wider">
                  {team.teamName}
                </div>
              )}
            </div>

          </div>

          {/* GAME ACHIEVEMENT BADGES GRID */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/60 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                🏅 Innovation Badges & Achievements
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Click any badge to check unlock criteria.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {badges.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                    b.unlocked 
                      ? 'bg-slate-900/60 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:scale-105' 
                      : 'bg-slate-950/40 border-slate-900 opacity-40 hover:opacity-75'
                  }`}
                >
                  <span className={`text-3xl filter ${b.unlocked ? 'none' : 'grayscale'}`}>{b.icon}</span>
                  <span className="text-[9px] font-bold text-white mt-2 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                    {b.title.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Review history logs */}
          {reviewHistory.length > 0 && (
            <div className="glass-card rounded-3xl p-6 border border-slate-800/60">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                📜 Journey Review History
              </h3>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 divide-y divide-slate-800/40">
                {reviewHistory.map((h, i) => (
                  <div key={i} className="pt-3 first:pt-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">
                        {DASHBOARD_COORDINATES[h.milestone_key]?.label || h.milestone_key}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                        h.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-light">{h.comments || 'No comments left.'}</p>
                    {h.required_corrections && (
                      <p className="text-[10px] text-red-400 mt-1 leading-normal font-light">
                        <span className="font-bold text-red-300">Required:</span> {h.required_corrections}
                      </p>
                    )}
                    <span className="text-[9px] text-gray-500 block mt-1.5 font-mono">
                      By: {h.reviewer_name} | {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Helper icons mapping
function coordIcon(key: string): string {
  return DASHBOARD_COORDINATES[key]?.icon || '📍';
}

// Status Badges
function statusLabelBadge(status: string) {
  switch (status) {
    case 'completed':
    case 'approved':
      return <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 text-[10px] uppercase px-2 py-0.5 rounded font-black">Completed</span>;
    case 'waiting_for_review':
      return <span className="bg-blue-950 text-blue-400 border border-blue-900/50 text-[10px] uppercase px-2 py-0.5 rounded font-black animate-pulse">Pending Review</span>;
    case 'rejected':
      return <span className="bg-red-950 text-red-400 border border-red-900/50 text-[10px] uppercase px-2 py-0.5 rounded font-black animate-bounce">Revision Required</span>;
    case 'in_progress':
      return <span className="bg-amber-950 text-amber-400 border border-amber-900/50 text-[10px] uppercase px-2 py-0.5 rounded font-black">In Progress</span>;
    case 'available':
      return <span className="bg-slate-900 text-gray-300 border border-slate-800 text-[10px] uppercase px-2 py-0.5 rounded font-black">Ready to Start</span>;
    default:
      return <span className="bg-slate-950/40 text-gray-600 border border-slate-900/60 text-[10px] uppercase px-2 py-0.5 rounded font-black">Locked</span>;
  }
}

// Detailed checklists based on milestone key
function milestoneChecklist(key: string): string[] {
  switch (key) {
    case 'stg_-1_prob_disc':
      return [
        'Perform industrial visits and survey campus or community challenges.',
        'Submit a list of 3 discovered problems with initial hypothesis details.',
        'Verify problem statement originality with literature logs.'
      ];
    case 'stg_-1_team_alloc':
      return [
        'Form a team of exactly 10 members: 4 Engineering, 3 Law, and 3 Business students.',
        'Assign a dedicated Faculty Coordinator/Advisor.',
        'Assign an Industry/Alumni mentor for startup consultation.'
      ];
    case 'stg_-1_prob_val':
      return [
        'Conduct field interviews and surveys with at least 50 target users.',
        'Validate problem feasibility under the advisory and research teams.',
        'Submit validated problem report with needs-discovery summary.'
      ];
    case 'qr1':
      return [
        'Determine whether the problem statement is significant and worth solving.',
        'Assess user demand, opportunity sizing, and preliminary technical feasibility.',
        'Obtain approval from the Quality Review panel to transition to Stage 0 (Idea).'
      ];
    case 'stg_0_ideation':
      return [
        'Brainstorm solution blueprints using design thinking methodologies.',
        'Perform patent prior-art indexing and analysis with Legal team advisors.',
        'Draft complete solution concept and product block diagram/architecture.'
      ];
    case 'qr2':
      return [
        'Verify solution originality, level of innovation, and user alignment.',
        'Review complete technical feasibility blueprints.',
        'Approved by panel to unlock prototype seed funding claims.'
      ];
    case 'stg_0_funding':
      return [
        'Prepare detailed Bill of Materials (BOM) with quotes and vendor sources.',
        'Submit seed grant requests for up to ₹50,000 for components/services.',
        'Gain access to AICTE IDEA Labs, IoT, and fabrication labs on campus.'
      ];
    case 'stg_0_proto_dev':
      return [
        'Procure components and fabricate early Proof of Concept (PoC) / MVP.',
        'Develop software modules, databases, and micro-controller firmware.',
        'Conduct internal diagnostics and functional assembly testing.'
      ];
    case 'qr3':
      return [
        'Verify that the fabricated prototype is fully operational and works.',
        'Evaluate engineering standards, electrical and mechanical safety features.',
        'Obtain panel approval to proceed to Product Validation.'
      ];
    case 'stg_1_prod_val':
      return [
        'Deploy the prototype in real-world sandbox environments.',
        'Conduct User Acceptance Testing (UAT) and capture telemetry data.',
        'Submit product validation results and customer feedback logs.'
      ];
    case 'qr4':
      return [
        'Verify validation feedback results and overall product readiness.',
        'Unlock parallel publishing and patent paths.'
      ];
    case 'stg_1_branch_pub':
      return [
        'Draft academic research paper detailing experimental results.',
        'Submit paper to approved national/international research journals.',
        'Log publication acceptance letter or conference certificate.'
      ];
    case 'stg_1_branch_pat':
      return [
        'Draft full patent claims specification with Law School mentors.',
        'Submit utility patent, copyright, or design registry application.',
        'Log patent registration receipt details in dashboard.'
      ];
    case 'stg_1_incubation':
      return [
        'Prepare legal onboarding and registration files for incubator.',
        'Access office space at Technology Business Incubator (TBI).',
        'Detail financial spreadsheets and GTM (Go-To-Market) plans.'
      ];
    case 'qr5':
      return [
        'Verify startup scalability, business viability, and team capabilities.',
        'Approved to register as active private limited startup entity.'
      ];
    case 'stg_1_scaling':
      return [
        'Secure scaling capital from Startup India, MSME, or VC angel funds.',
        'Establish bulk manufacturing networks or high-availability app servers.',
        'Formulate client acquisition cost (CAC) and marketing channels.'
      ];
    case 'stg_1_impact':
      return [
        'Deploy commercial operations and acquire paying customers.',
        'Track and log revenue metrics and social/industrial impact outcomes.',
        'Maintain active mentoring with alumni advisory teams.'
      ];
    default:
      return ['Complete previous milestones to reveal parameters.'];
  }
}

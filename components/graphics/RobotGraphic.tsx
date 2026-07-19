'use client';

import React from 'react';

export default function RobotGraphic() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center min-h-[450px]">
      
      {/* 100% Reliable Native CSS Stylesheet for SVG Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-action {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes head-bob-action {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes sway-left-action {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes sway-right-action {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes heartbeat-dash {
          to { strokeDashoffset: 0; }
        }
        @keyframes eyes-blink-action {
          0%, 45%, 55%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        @keyframes thrust-pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.7; }
          50% { transform: scaleY(1.3); opacity: 0.95; }
        }

        /* Class bindings */
        .robot-floating-container {
          animation: float-action 5s ease-in-out infinite;
        }
        .robot-head-group {
          animation: head-bob-action 4s ease-in-out infinite;
          transform-origin: 200px 140px;
        }
        .robot-arm-left-group {
          animation: sway-left-action 4s ease-in-out infinite;
          transform-origin: 130px 190px;
        }
        .robot-arm-right-group {
          animation: sway-right-action 4s ease-in-out infinite;
          transform-origin: 270px 190px;
        }
        .robot-eye-left-el {
          animation: eyes-blink-action 4.5s ease-in-out infinite;
          transform-origin: 178px 105px;
        }
        .robot-eye-right-el {
          animation: eyes-blink-action 4.5s ease-in-out infinite;
          transform-origin: 222px 105px;
        }
        .robot-screen-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: heartbeat-dash 2.5s linear infinite;
        }
        .robot-engine-thrust {
          animation: thrust-pulse 0.8s ease-in-out infinite;
          transform-origin: 200px 290px;
        }
      `}} />

      {/* Glow Effects behind the Robot */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute w-56 h-56 rounded-full bg-indigo-500/15 blur-[60px] animate-pulse pointer-events-none delay-700" />
      <div className="absolute w-40 h-40 rounded-full bg-amber-500/5 blur-[50px] pointer-events-none" />

      {/* Floating Robot Container */}
      <div className="relative w-full max-w-sm flex flex-col items-center justify-center robot-floating-container">
        
        {/* SVG Robot Graphic */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto drop-shadow-[0_0_35px_rgba(59,130,246,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definitions for gradients and clips */}
          <defs>
            <linearGradient id="robo-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="robo-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Orbiting Space Rings (Yantriksha Satellite Theme) */}
          <g className="animate-[spin_25s_linear_infinite] origin-[200px_190px]">
            <ellipse
              cx="200"
              cy="190"
              rx="160"
              ry="45"
              stroke="url(#robo-glow)"
              strokeWidth="2.5"
              strokeDasharray="12, 12"
              opacity="0.6"
            />
            {/* Satellite Nodes on Orbit */}
            <circle cx="50" cy="170" r="6" fill="#f59e0b" filter="url(#neon-glow)" />
            <circle cx="350" cy="210" r="4" fill="#3b82f6" filter="url(#neon-glow)" />
          </g>

          <g className="animate-[spin_15s_linear_infinite_reverse] origin-[200px_190px]">
            <ellipse
              cx="200"
              cy="190"
              rx="135"
              ry="30"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="6, 6"
              opacity="0.4"
            />
            <circle cx="200" cy="160" r="5" fill="#10b981" filter="url(#neon-glow)" />
          </g>

          {/* 2. Hover Engine Thrust (Bottom) */}
          <g className="translate-y-[-10px]">
            {/* Fire/Plasma wave */}
            <path
              d="M175,290 Q200,350 225,290 Z"
              fill="url(#robo-glow)"
              opacity="0.8"
              filter="url(#neon-glow)"
              className="robot-engine-thrust"
            />
            <path
              d="M185,290 Q200,325 215,290 Z"
              fill="#ffffff"
              opacity="0.9"
              filter="url(#neon-glow)"
            />
          </g>

          {/* 3. Arms (Mechanical Joint Pivot) */}
          {/* Left Arm */}
          <g className="robot-arm-left-group">
            {/* Shoulder joint */}
            <circle cx="130" cy="190" r="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            {/* Arm segment */}
            <rect x="80" y="184" width="50" height="12" rx="6" fill="url(#robo-metal)" stroke="#475569" />
            {/* Claws */}
            <path d="M75,178 Q65,190 75,202" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="78" cy="190" r="3" fill="#6366f1" />
          </g>

          {/* Right Arm */}
          <g className="robot-arm-right-group">
            {/* Shoulder joint */}
            <circle cx="270" cy="190" r="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            {/* Arm segment */}
            <rect x="270" y="184" width="50" height="12" rx="6" fill="url(#robo-metal)" stroke="#475569" />
            {/* Claws */}
            <path d="M325,178 Q335,190 325,202" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="322" cy="190" r="3" fill="#6366f1" />
          </g>

          {/* 4. Torso Body */}
          <rect x="140" y="160" width="120" height="130" rx="25" fill="url(#robo-metal)" stroke="#475569" strokeWidth="3" />
          
          {/* Chest Digital Screen */}
          <rect x="155" y="175" width="90" height="70" rx="12" fill="#020617" stroke="#1e293b" strokeWidth="2" />
          
          {/* Grid lines inside Screen */}
          <path d="M155,210 L245,210 M200,175 L200,245" stroke="#1e293b" strokeWidth="1" opacity="0.3" />

          {/* Glowing Pulse Heartbeat / Graph Line on Screen */}
          <path
            d="M160,210 H185 L192,185 L200,230 L208,195 L215,215 L222,205 H240"
            stroke="url(#robo-glow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neon-glow)"
            className="robot-screen-line"
          />

          {/* Tiny LED Power Indicators */}
          <circle cx="170" cy="232" r="3" fill="#10b981" filter="url(#neon-glow)" className="animate-pulse" />
          <circle cx="182" cy="232" r="3" fill="#3b82f6" filter="url(#neon-glow)" />
          <circle cx="194" cy="232" r="3" fill="#f59e0b" filter="url(#neon-glow)" className="animate-pulse" />

          {/* 5. Neck */}
          <rect x="185" y="138" width="30" height="25" rx="5" fill="#475569" stroke="#1e293b" strokeWidth="2" />
          {/* Neck rings */}
          <line x1="188" y1="145" x2="212" y2="145" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="188" y1="152" x2="212" y2="152" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />

          {/* 6. Head Unit */}
          <g className="robot-head-group">
            
            {/* Top Head Antenna */}
            <rect x="196" y="45" width="8" height="35" fill="url(#robo-metal)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="200" cy="40" r="7" fill="#f59e0b" filter="url(#neon-glow)" className="animate-pulse" />

            {/* Helmet Ears / Sensors */}
            <rect x="123" y="93" width="18" height="28" rx="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
            <rect x="259" y="93" width="18" height="28" rx="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />

            {/* Head Core Dome */}
            <rect x="135" y="70" width="130" height="75" rx="32" fill="url(#robo-metal)" stroke="#475569" strokeWidth="3" />
            
            {/* Glass Face Shield */}
            <rect x="145" y="80" width="110" height="50" rx="20" fill="#020617" stroke="#1e293b" strokeWidth="2" />

            {/* Cyan glowing digital Eyes */}
            <ellipse cx="178" cy="105" rx="14" ry="7" fill="#00f2fe" filter="url(#neon-glow)" className="robot-eye-left-el" />
            <ellipse cx="222" cy="105" rx="14" ry="7" fill="#00f2fe" filter="url(#neon-glow)" className="robot-eye-right-el" />

            {/* Eye pupil overlays */}
            <circle cx="178" cy="105" r="3" fill="#ffffff" />
            <circle cx="222" cy="105" r="3" fill="#ffffff" />
          </g>

        </svg>

        {/* Outer UI Indicators */}
        <div className="absolute -bottom-8 bg-slate-900/90 border border-blue-500/20 backdrop-blur px-5 py-2.5 rounded-full flex items-center gap-3 text-xs shadow-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-blue-400 font-bold uppercase tracking-wider">Yantriksha Assistant Online</span>
        </div>

      </div>

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashPreloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.6 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1600);

    // Completely remove from DOM after 2.2 seconds (allows 600ms transition)
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#030712] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Space grid background effect in the splash screen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Outer spinning cyberpunk glow ring */}
      <div className="absolute h-64 w-64 rounded-full border border-blue-500/10 border-t-blue-500/80 animate-spin" style={{ animationDuration: '2.5s' }} />
      <div className="absolute h-72 w-72 rounded-full border border-dashed border-indigo-500/10 border-r-indigo-500/40 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-pulse">
        {/* Futuristic Brand Title */}
        <h2 className="text-xl sm:text-2xl font-black tracking-[0.4em] text-white uppercase text-center font-display drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
          Yantriksha
        </h2>

        {/* Central Logo with Neon Backglow */}
        <div className="relative h-44 w-44 sm:h-52 sm:w-52">
          {/* Backglow element */}
          <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-2xl animate-pulse" />
          <Image
            src="/logo.png"
            alt="Yantriksha X Hub Logo"
            fill
            className="object-contain"
            style={{ mixBlendMode: 'screen' }}
            priority
          />
        </div>

        {/* Brand Subtitle */}
        <h3 className="text-lg sm:text-xl font-bold tracking-[0.5em] text-blue-400 uppercase text-center font-display drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
          Hub
        </h3>
      </div>

      {/* Cyberpunk loading status indicators at the bottom */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        {/* Loading Progress Bar */}
        <div className="w-48 h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 rounded-full animate-[loading-bar_1.6s_ease-out_forwards]" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[10px] tracking-[0.2em] font-mono text-gray-500 uppercase">
            Initializing Hub
          </span>
        </div>
      </div>

      {/* Custom keyframes injection inside component */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />

    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';

interface LoaderOverlayProps {
  onComplete: () => void;
}

export default function LoaderOverlay({ onComplete }: LoaderOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "INITIALIZING CORE SYSTEM CONFIG...",
    "ESTABLISHING SECURE HANDSHAKE TO NEON POSTGRES...",
    "PARSING DRIZZLE DATABASE SCHEMA...",
    "RESOLVING WORKSPACE DEPENDENCIES...",
    "SYNCING M-PESA WEBHOOKS CALLBACK ENDPOINTS...",
    "CALCULATING ARREARS AND INVOICE LEDGERS...",
    "STARTING COMMUNICATION DAEMON WORKERS...",
    "RENDER COMPLETED successfully."
  ];

  useEffect(() => {
    const duration = 700; // total animation time in ms
    const intervalTime = 15;
    const steps = duration / intervalTime;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const nextProgress = Math.min(100, Math.round((stepCount / steps) * 100));
      setProgress(nextProgress);

      // Distribute logs over progress
      const currentLog = Math.min(logs.length - 1, Math.floor((nextProgress / 100) * logs.length));
      setLogIndex(currentLog);

      if (stepCount >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between p-8 bg-[#050505] font-mono text-[10px] tracking-wider text-[var(--text-muted)] select-none">
      {/* Corner telemetry decorations */}
      <div className="flex justify-between items-center opacity-40">
        <span>SYS.LOADER // REV_0.4.1</span>
        <span>STATUS: SYSTEM_SYNC_ACTIVE</span>
      </div>

      {/* Center status display */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div className="text-4xl md:text-6xl font-black text-white tracking-tighter">
          {progress}%
        </div>
        <div className="w-48 h-[2px] bg-[#1a1a1a] relative overflow-hidden rounded-full">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-[var(--accent)] transition-all duration-75"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px var(--accent-glow)' }}
          />
        </div>
        <div className="text-center max-w-md h-6 overflow-hidden flex items-center justify-center">
          <span className="text-[9px] text-[var(--accent)] animate-pulse">
            &gt; {logs[logIndex]}
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-center opacity-40">
        <span>EST. TIME: 0.70S</span>
        <span>© {new Date().getFullYear()} DANE PMS</span>
      </div>

      {/* Cyberpunk Scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] opacity-20" />
    </div>
  );
}

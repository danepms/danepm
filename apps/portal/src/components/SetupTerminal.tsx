"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

const getTimestamp = () => {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}]`;
};

interface SetupTerminalProps {
  mode: 'login' | 'signup' | 'wizard';
  signupRole: 'manager' | 'owner' | 'tenant' | null;
  wizardStep: number;
  wizardData: any;
}

export const SetupTerminal = ({ mode, signupRole, wizardStep, wizardData }: SetupTerminalProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const pushLog = (msg: string, delay = 0) => {
    setTimeout(() => {
      setLogs(prev => [...prev, `${getTimestamp()} ${msg}`]);
    }, delay);
  };

  useEffect(() => {
    setLogs([]);
    if (mode === 'login') {
      pushLog("> Welcome home! It's lovely to see you again.", 100);
      pushLog("> I'm ready whenever you are.", 400);
      pushLog("> Standing by to sign you in...", 800);
    } else if (mode === 'signup') {
      pushLog("> Hello! We're so excited to get you set up.", 100);
      pushLog("> Please tell me a bit about your role first.", 500);
    } else if (mode === 'wizard') {
      pushLog("> Starting the setup for your first property.", 100);
      pushLog("> I'll guide you through each step.", 400);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'signup' && signupRole) {
      const msgs: Record<'manager' | 'owner' | 'tenant', string> = {
        manager: "> Manager profile chosen. Preparing your tools...",
        owner: "> Owner profile chosen. Setting up your dashboard...",
        tenant: "> Tenant profile chosen. Let's find your new home portal."
      };
      if (signupRole) pushLog(msgs[signupRole], 100);
    }
  }, [signupRole, mode]);

  useEffect(() => {
    if (mode === 'wizard') {
      if (wizardStep === 2) {
        pushLog(`> Saving: ${wizardData.name || 'New Property'}`, 100);
        pushLog(`> Location set to ${wizardData.location || 'Nairobi'}`, 400);
      }
      if (wizardStep === 3) {
        pushLog("> Finishing up the details...", 100);
        pushLog("> Success! Your property is ready.", 600);
      }
    }
  }, [wizardStep, mode, wizardData.name, wizardData.location]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="hidden md:flex w-1/3 bg-[var(--bg-panel)] glass-card border-r border-[var(--border)] p-8 flex-col justify-between h-screen sticky top-0 overflow-hidden transition-all duration-500 z-20 rounded-r-xl shadow-2xl">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-[var(--text-muted)]" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Assistant</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
        </div>

        <div className="font-mono text-xs text-[var(--text-muted)] space-y-3 flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {logs.map((log, i) => <div key={i} className="break-all leading-relaxed opacity-80">{log}</div>)}
          <div className="text-[var(--text-base)] mt-2 flex items-center">
             <span className="text-[var(--accent-bg)] font-bold mr-2">{'>'}</span> 
             <span className="w-2 h-3 bg-[var(--accent-bg)] inline-block cursor-blink"></span>
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
      
      <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase border-t border-[var(--border)] pt-4 mt-4 shrink-0 flex justify-between">
        <span>STATUS: READY</span>
        <span className="text-[var(--accent-bg)] font-bold tracking-widest">CONNECTED</span>
      </div>
    </div>
  );
};

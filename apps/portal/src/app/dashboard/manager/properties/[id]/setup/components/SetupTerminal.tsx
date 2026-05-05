"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface SetupTerminalProps {
  step: number;
  utilitiesData: any;
  logsOverride: string | null;
  propertyName: string;
}

export const SetupTerminal = ({ step, utilitiesData, logsOverride, propertyName }: SetupTerminalProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getTimestamp = () => {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}]`;
  };

  const pushLog = (msg: string, delay = 0) => {
    setTimeout(() => {
      setLogs(prev => [...prev, `${getTimestamp()} ${msg}`]);
    }, delay);
  };

  useEffect(() => {
    if (logsOverride) {
      pushLog(logsOverride, 0);
      return;
    }

    if (step === 1) {
      pushLog(`> Initializing layout mapping for ${propertyName || 'property'}...`, 100);
      pushLog("> Let's define your building structure first.", 400);
    }
    if (step === 2) {
      pushLog(`> Layout saved! Now let's set the base rent.`, 100);
    }
    if (step === 3) {
      pushLog(`> Great! Rent prices saved.`, 100);
      pushLog(`> Now, let's talk about utilities.`, 400);
    }
    if (step === 4) {
      pushLog(`> Utilities configured. Any move-in fees?`, 100);
    }
    if (step === 5) {
      pushLog(`> Move-in fees registered.`, 100);
      pushLog(`> Finally, let's map out who lives where.`, 400);
    }
    if (step === 6) {
      pushLog(`> Property fully initialized!`, 100);
    }
  }, [step, utilitiesData, logsOverride, propertyName]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="hidden md:flex w-1/3 bg-[var(--bg-panel)] border-r border-[var(--border)] p-8 flex-col justify-between h-screen sticky top-0 overflow-hidden transition-colors duration-300">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)] shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-[var(--text-muted)]" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">System_Log</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-[var(--border)] rounded-none"></div>
            <div className="w-2 h-2 bg-[var(--text-muted)] rounded-none"></div>
            <div className="w-2 h-2 bg-[var(--text-base)] rounded-none"></div>
          </div>
        </div>

        <div className="font-mono text-xs text-[var(--text-muted)] space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-4">
          {logs.map((log, i) => (
            <div key={i} className="break-all">{log}</div>
          ))}
          <div className="text-[var(--text-base)] mt-2 flex items-center">
             <span className="text-[var(--accent-bg)] font-bold mr-2">{'>'}</span> 
             <span className="w-2 h-3 bg-[var(--accent-bg)] inline-block cursor-blink"></span>
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
      
      <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase border-t border-[var(--border)] pt-4 mt-4 shrink-0 flex justify-between transition-colors">
        <span>Logged in as: Manager</span>
        <span className="text-[var(--accent-bg)] font-bold">Status: Helpful Mode ON</span>
      </div>
    </div>
  );
};

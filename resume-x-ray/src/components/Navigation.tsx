"use client";

import React from "react";
import { Shield, Activity, Fingerprint, Sparkles } from "lucide-react";

export function Navigation() {

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
          <Fingerprint className="w-5 h-5" />
        </div>
        <span className="text-xl font-semibold tracking-tight">
          Resume<span className="text-cyan-400">X-Ray</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a 
          href="/interview" 
          className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
        >
          Agentic Interview
        </a>
        <a 
          href="/validation" 
          className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
        >
          Validation Arena
        </a>
        <a 
          href="/catalyst" 
          className="text-sm font-medium text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 rounded-full hover:bg-cyan-500/10 transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Contribution Catalyst
        </a>
        <a 
          href="/" 
          className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}

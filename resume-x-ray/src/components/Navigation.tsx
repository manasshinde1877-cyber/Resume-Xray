"use client";

import React from "react";
import { Eye, EyeOff, Shield, Activity, Fingerprint } from "lucide-react";
import { useBlindMode } from "@/context/BlindModeContext";
import { motion } from "framer-motion";

export function Navigation() {
  const { isBlindMode, toggleBlindMode } = useBlindMode();

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
          href="/" 
          className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition"
        >
          Dashboard
        </a>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleBlindMode}
          className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${
            isBlindMode
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          {isBlindMode ? (
            <>
              <Shield className="w-4 h-4" />
              Blind Mode: ON
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Blind Mode: OFF
            </>
          )}
        </motion.button>
      </div>
    </nav>
  );
}

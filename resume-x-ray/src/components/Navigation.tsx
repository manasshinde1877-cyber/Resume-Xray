"use client";

import React, { useState, useEffect } from "react";
import { Fingerprint, Sparkles, Shield, Activity, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/interview", label: "Agentic Interview" },
  { href: "/validation", label: "Analysis Loop" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = pathname;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 transition-all duration-500 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 shadow-xl shadow-black/30"
          : "bg-slate-950/60 backdrop-blur-md border-b border-slate-800/30"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/60 group-hover:shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all duration-300">
          <Fingerprint className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Resume<span className="text-cyan-400">X-Ray</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
              active === link.href
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active === link.href && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 bg-slate-800 rounded-lg border border-slate-700/50"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{link.label}</span>
            {active !== link.href && (
              <span className="absolute inset-0 bg-slate-800/0 hover:bg-slate-800/50 rounded-lg transition-colors" />
            )}
          </Link>
        ))}

        {/* Catalyst - Special CTA */}
        <Link
          href="/catalyst"
          className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 text-cyan-300 hover:from-cyan-600/30 hover:to-purple-600/30 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300"
        >
          <motion.span
            animate={{ rotate: [0, 20, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </motion.span>
          Contribution Catalyst
        </Link>
      </div>
    </nav>
  );
}

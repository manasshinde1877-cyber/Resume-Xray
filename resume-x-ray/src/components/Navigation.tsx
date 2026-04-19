"use client";

import React, { useState, useEffect } from "react";
import { Fingerprint, Sparkles, Shield, Activity, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "ATS parsing vs Human Recruiter" },
  { href: "/interview", label: "Agentic Interview" },
  { href: "/validation", label: "Validation arena" },
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
          ? "bg-white/90 backdrop-blur-2xl border-b border-primary-green/10 shadow-xl shadow-primary-green/5"
          : "bg-white/60 backdrop-blur-md border-b border-white/30"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-primary-green/10 border border-primary-green/30 flex items-center justify-center text-sage group-hover:bg-primary-green/20 group-hover:border-primary-green/60 group-hover:shadow-[0_0_16px_rgba(84,107,65,0.3)] transition-all duration-300">
          <Fingerprint className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          Resume<span className="text-primary-green">X-Ray</span>
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
                ? "text-primary-green"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {active === link.href && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 bg-primary-green/10 rounded-lg border border-primary-green/20"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{link.label}</span>
            {active !== link.href && (
              <span className="absolute inset-0 bg-primary-green/0 hover:bg-primary-green/5 rounded-lg transition-colors" />
            )}
          </Link>
        ))}

        {/* Catalyst - Special CTA */}
        <Link
          href="/catalyst"
          className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-primary-green/20 to-sage/20 border border-primary-green/30 text-sage hover:from-primary-green/30 hover:to-sage/30 hover:border-sage/50 hover:shadow-[0_0_20px_rgba(153,173,122,0.2)] transition-all duration-300"
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

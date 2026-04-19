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

import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/firebase/auth";

export function Navigation() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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
            prefetch={true}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group flex items-center justify-center ${
              active === link.href
                ? "text-primary-green bg-primary-green/10"
                : "text-foreground/60 md:hover:text-foreground md:hover:bg-primary-green/5"
            }`}
          >
            <span className="relative z-10">{link.label}</span>
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

        {user ? (
          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-primary-green/10">
            <span className="text-[10px] font-bold text-primary-green/60 uppercase tracking-tighter max-w-[80px] truncate">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/#auth-section"
            className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-primary-green text-cream hover:bg-sage transition-all duration-300"
          >
            Launch Agent
          </Link>
        )}
      </div>
    </nav>
  );
}

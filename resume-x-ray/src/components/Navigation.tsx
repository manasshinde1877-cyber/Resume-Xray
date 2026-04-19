"use client";

import React, { useState, useEffect } from "react";
import { Fingerprint, Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/lib/firebase/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "ATS parsing vs Human Recruiter" },
  { href: "/interview", label: "Agentic Interview" },
  { href: "/validation", label: "Validation arena" },
];

export function Navigation() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('dev_bypass_user');
      localStorage.removeItem('REDACTED_BY_DEFAULT');
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const active = pathname;

  if (pathname === "/") return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 md:px-6 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-2xl border-b border-primary-green/10 shadow-xl shadow-primary-green/5"
            : "bg-white/60 backdrop-blur-md border-b border-white/30"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary-green/10 border border-primary-green/30 flex items-center justify-center text-sage group-hover:bg-primary-green/20 group-hover:border-primary-green/60 group-hover:shadow-[0_0_16px_rgba(84,107,65,0.3)] transition-all duration-300">
            <Fingerprint className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Resume<span className="text-primary-green">X-Ray</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`relative px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
                active === link.href
                  ? "text-primary-green bg-primary-green/10"
                  : "text-foreground/60 hover:text-foreground hover:bg-primary-green/5"
              }`}
            >
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}

          {/* Catalyst - Special CTA */}
          <Link
            href="/catalyst"
            className="ml-1 xl:ml-2 flex items-center gap-2 px-3 xl:px-4 py-2 text-xs xl:text-sm font-bold rounded-full bg-gradient-to-r from-primary-green/20 to-sage/20 border border-primary-green/30 text-sage hover:from-primary-green/30 hover:to-sage/30 hover:border-sage/50 hover:shadow-[0_0_20px_rgba(153,173,122,0.2)] transition-all duration-300"
          >
            <motion.span
              animate={{ rotate: [0, 20, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
            <span className="hidden xl:inline">Contribution Catalyst</span>
            <span className="xl:hidden">Catalyst</span>
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-xl border border-primary-green/20 text-primary-green hover:bg-primary-green/10 transition-all"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-primary-green/10 overflow-y-auto lg:hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-4 rounded-2xl text-base font-semibold transition-all ${
                    active === link.href
                      ? "text-primary-green bg-primary-green/10 border border-primary-green/20"
                      : "text-foreground/70 hover:bg-primary-green/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/catalyst"
                className="mt-2 flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-primary-green/10 to-sage/10 border border-primary-green/20 text-sage"
              >
                <Sparkles className="w-4 h-4" />
                Contribution Catalyst
              </Link>

              <div className="mt-4 pt-4 border-t border-primary-green/10">
                {user ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-green/60 uppercase tracking-wider truncate max-w-[200px]">
                      {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/#auth-section"
                    className="block w-full text-center px-5 py-4 text-base font-bold rounded-2xl bg-primary-green text-cream"
                  >
                    Launch Agent
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

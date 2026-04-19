"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, LogIn, UserPlus, ShieldCheck, Mail, Lock, ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { RepellingCubes } from "@/components/RepellingCubes";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const authSectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax for floating images
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, 100]);
  const rotate1 = useTransform(scrollY, [0, 500], [-12, -20]);
  const rotate2 = useTransform(scrollY, [0, 500], [12, 20]);

  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-transparent">
      {/* ── SECTION 1: HERO ──────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden snap-start">
        {/* Background Layer */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#546B41] via-[#99AD7A] to-[#DCCCAC] -z-10" />

        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-[22vw] font-black text-cream/30 tracking-tight leading-[0.75] uppercase"
            >
              RESUME
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="text-[22vw] font-black text-cream/30 tracking-tight leading-[0.75] uppercase"
            >
              X-RAY
            </motion.h1>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full h-full flex items-center justify-center">
          <motion.div
            style={{ y: springY1, rotate: rotate1 }}
            className="absolute top-[10%] left-[10%] w-[25vw] h-[35vw] max-w-[400px] max-h-[550px] z-30 cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 12 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full"
              >
                <img
                  src="/landing/resume_modern.jpg"
                  alt="Representative Resume"
                  className="w-full h-full object-cover rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: springY2, rotate: rotate2 }}
            className="absolute top-[18%] right-[10%] w-[25vw] h-[35vw] max-w-[400px] max-h-[550px] z-30 cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -12 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full"
              >
                <img
                  src="/landing/resume2.jpg"
                  alt="Modern CV Template Package"
                  className="w-full h-full object-cover rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Badge */}
          <div className="relative z-30 text-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-cream text-sm font-bold uppercase tracking-[0.3em] shadow-2xl"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-cream" />
              Intelligence Tier Activated
            </motion.div>
          </div>

          {/* Hero Bottom Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-6"
          >
            <button
              onClick={scrollToAuth}
              className="group px-10 py-5 bg-primary-green text-cream font-bold rounded-2xl hover:bg-sage transition-all duration-300 shadow-2xl hover:scale-105 flex items-center gap-3 text-lg"
            >
              Login / Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-1 text-cream/40"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll Down</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: AUTH SCREEN ────────────────────────── */}
      <section
        ref={authSectionRef}
        id="auth-section"
        className="relative h-screen w-full flex flex-col items-center justify-center p-12 snap-start"
      >
        <div className="absolute inset-0 bg-[#F2EBE0] -z-10" />
        <RepellingCubes />

        <div className="max-w-7xl w-full flex flex-col gap-12 relative z-30">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center md:text-left"
          >
            <h2 className="text-6xl font-black text-primary-green leading-tight">
              Join the <span className="italic font-light serif text-sage relative top-4">New Frontier.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left: Login Workspace */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                viewport={{ once: false, amount: 0.3 }}
                className="bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-primary-green/10 p-10 relative overflow-hidden"
              >
                <div className="flex bg-primary-green/5 p-1.5 rounded-2xl mb-10">
                  <button
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === "login" ? "bg-white text-primary-green shadow-sm" : "text-primary-green/40 hover:text-primary-green/60"}`}
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </button>
                  <button
                    onClick={() => setAuthMode("signup")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${authMode === "signup" ? "bg-white text-primary-green shadow-sm" : "text-primary-green/40 hover:text-primary-green/60"}`}
                  >
                    <UserPlus className="w-4 h-4" /> Sign Up
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary-green/50 px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-green/30" />
                      <input
                        type="email"
                        placeholder="name@company.com"
                        className="w-full bg-primary-green/5 border border-primary-green/10 rounded-2xl py-4 pl-12 pr-4 text-primary-green placeholder:text-primary-green/20 focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary-green/50 px-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-green/30" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full bg-primary-green/5 border border-primary-green/10 rounded-2xl py-4 pl-12 pr-12 text-primary-green placeholder:text-primary-green/20 focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-primary-green/30 hover:text-primary-green/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="w-full py-5 bg-primary-green text-cream font-bold rounded-2xl shadow-xl shadow-primary-green/20 hover:bg-sage transition-all duration-300 flex items-center justify-center gap-3 text-lg mt-4 group"
                  >
                    {authMode === "login" ? "Enter Workspace" : "Create Account"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="p-4 rounded-2xl bg-primary-green/20 border border-primary-green/30 flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-primary-green flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-primary-green text-sm">Neural Lock</h4>
                    <p className="text-xs text-primary-green/70">Anti-cheat proctoring.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-primary-green/20 border border-primary-green/30 flex items-center gap-4">
                  <Sparkles className="w-6 h-6 text-primary-green flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-primary-green text-sm">AI Synthesis</h4>
                    <p className="text-xs text-primary-green/70">Deep semantic analysis.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Frame Visual (No Box, Same Shadow as Hero) */}
            <div className="relative h-[500px] w-full hidden md:flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Girl - Fast start, slow glide */}
                <motion.div
                  initial={{ x: 150, y: -20, opacity: 0 }}
                  whileInView={{ x: 0, y: -20, opacity: 1 }}
                  transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: false }}
                  className="absolute z-10 w-[56%] h-auto"
                >
                  <img
                    src="/landing/Girl.png"
                    alt="Career Growth"
                    className="w-full h-auto filter drop-shadow-[0_50px_100px_rgba(0,0,0,0.4)]"
                  />
                </motion.div>

                {/* Frame - Sticking on top */}
                <motion.div
                  initial={{ y: 20, opacity: 1 }}
                  whileInView={{ y: -40, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  viewport={{ once: false }}
                  className="absolute z-20 w-[85%] h-auto pointer-events-none"
                >
                  <img
                    src="/landing/Frame.png"
                    alt="Framing Excellence"
                    className="w-full h-auto filter drop-shadow-[0_50px_100px_rgba(0,0,0,0.4)]"
                  />
                  {/* Descriptive Tagline beneath the frame */}
                </motion.div>
                
                {/* Descriptive Tagline - Synchronized and High Contrast */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                  className="absolute bottom-2.5 left-0 right-0 text-center text-primary-green font-bold text-[17px] leading-relaxed uppercase tracking-[0.15em] z-30 pointer-events-auto"
                >
                  Unlock deep <br/>semantic insights,<br /> real-time proctoring,<br /> and strategic<br/> contribution <br />mapping.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .snap-y::-webkit-scrollbar { display: none; }
        .snap-y { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

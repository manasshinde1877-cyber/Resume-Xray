"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, LogIn, UserPlus, ShieldCheck, Mail, Lock, ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { RepellingCubes } from "@/components/RepellingCubes";

import { registerUser, loginUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const authSectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const handleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      if (authMode === "login") {
        const user = await loginUser(email, password);
        localStorage.setItem('dev_bypass_user', JSON.stringify(user));
      } else {
        const user = await registerUser(email, password);
        localStorage.setItem('dev_bypass_user', JSON.stringify(user));
      }
      // Set a session flag for bypass mode
      localStorage.setItem('REDACTED_BY_DEFAULT', 'true');
      
      // Full page reload into dashboard to ensure AuthContext picks up the bypass
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Auth failed: Check details");
    } finally {
      setLoading(false);
    }
  };

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
              className="text-[20vw] md:text-[22vw] font-black text-cream/30 tracking-tight leading-[0.75] uppercase"
            >
              RESUME
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="text-[20vw] md:text-[22vw] font-black text-cream/30 tracking-tight leading-[0.75] uppercase"
            >
              X-RAY
            </motion.h1>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full h-full flex items-center justify-center">
          <motion.div
            style={{ y: springY1, rotate: rotate1 }}
            className="absolute top-[15%] left-[5%] md:left-[10%] w-[40vw] md:w-[25vw] h-auto aspect-[3/4] max-w-[400px] z-30 cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full"
              >
                <img
                  src="/landing/resume_modern.jpg"
                  alt="Representative Resume"
                  className="w-full h-full object-cover rounded-2xl md:rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: springY2, rotate: rotate2 }}
            className="absolute bottom-[20%] right-[5%] md:top-[18%] md:right-[10%] w-[35vw] md:w-[25vw] h-auto aspect-[3/4] max-w-[400px] z-30 cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full"
              >
                <img
                  src="/landing/resume2.jpg"
                  alt="Modern CV Template Package"
                  className="w-full h-full object-cover rounded-2xl md:rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Badge */}
          <div className="relative z-30 text-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-cream text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] shadow-2xl"
            >
              <Sparkles className="w-3 md:w-4 h-3 md:h-4 animate-pulse text-cream" />
              Intelligence Tier Activated
            </motion.div>
          </div>

          {/* Hero Bottom Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 md:gap-6 w-full px-6"
          >
            <button
              onClick={scrollToAuth}
              className="group w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary-green text-cream font-bold rounded-2xl hover:bg-sage transition-all duration-300 shadow-2xl hover:scale-105 flex items-center justify-center gap-3 text-base md:text-lg"
            >
              Login / Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-1 text-cream/40"
            >
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em]">Scroll Down</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: VISION BREAK ───────────────────────── */}
      <section className="relative h-screen w-full flex items-center justify-center p-6 md:p-24 snap-start bg-[#C3CC9B] overflow-hidden">
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center relative z-10">
          {/* Left Side: Visual Focal Point */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: false, amount: 0.3 }}
            className="relative flex items-center justify-center h-full min-h-[500px]"
          >
            {/* Boy Avatar (Main Focus - Now behind frame) */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                x: ["-50%", "-50%", "-50%"] 
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[80%] top-1/2 w-[60%] h-auto z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <img 
                src="/landing/Boy.png" 
                alt="Boy Avatar"
                className="w-full h-full object-contain filter drop-shadow-2xl"
                style={{ transform: "scaleX(-1)" }}
              />
            </motion.div>

            {/* Decorative Frame (Overlay Container) */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 1, 0, -1, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center p-4 z-20"
            >
              <img 
                src="/landing/Frame.png" 
                alt="Vision Frame"
                className="w-full max-w-[500px] object-contain drop-shadow-[0_20px_50px_rgba(84,107,65,0.15)]"
                style={{ 
                  filter: "brightness(0) saturate(100%) invert(98%) sepia(21%) saturate(220%) hue-rotate(344deg) brightness(101%) contrast(101%)"
                }}
              />
            </motion.div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.3 }}
            className="flex flex-col gap-12"
          >
            {/* Heading in a single line */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary-green/40 uppercase tracking-[0.8em] block">
                The New Standard
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-primary-green uppercase tracking-tighter whitespace-nowrap">
                Why use Resume X-Ray?
              </h2>
            </div>

            {/* Reality Content vertically stacked below heading */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-primary-green leading-tight max-w-lg">
                  In 2026, <span className="italic serif text-cream/70">98% of resumes</span> are filtered by "Black Box" AI systems.
                </h3>
                <p className="text-primary-green/70 font-medium text-lg leading-relaxed max-w-md">
                  Students are being ghosted because resumes are <span className="text-primary-green font-bold">mathematically invisible</span> to non-semantic algorithms.
                </p>
              </div>

              <div className="space-y-6 border-t border-primary-green/10 pt-10 max-w-md">
                <p className="text-primary-green/70 font-medium text-lg leading-relaxed">
                  Candidates lack visibility into how machines parse their identity, leading to profound <span className="italic serif text-cream/70">frustration and bias.</span>
                </p>
                <div className="h-[2px] w-24 bg-primary-green/20" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Accent */}
        <motion.div 
           animate={{ rotate: 360 }} 
           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
           className="absolute -right-[15%] -top-[15%] w-[40vw] h-[40vw] rounded-full border border-primary-green/5 pointer-events-none"
        />
      </section>

      {/* ── SECTION 3: AUTH SCREEN ────────────────────────── */}
      <section
        ref={authSectionRef}
        id="auth-section"
        className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 snap-start py-20"
      >
        <div className="absolute inset-0 bg-[#F2EBE0] -z-10" />
        <RepellingCubes />

        <div className="max-w-7xl w-full flex flex-col gap-8 md:gap-12 relative z-30">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-center md:text-left"
          >
            <h2 className="text-4xl md:text-6xl font-black text-primary-green leading-tight">
              Join the <span className="italic font-light serif text-sage md:relative md:top-4">New Frontier.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: Login Workspace */}
            <div className="space-y-8 md:space-y-12 order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                viewport={{ once: false, amount: 0.3 }}
                className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-primary-green/10 p-6 md:p-10 relative overflow-hidden"
              >
                <div className="flex bg-primary-green/5 p-1.5 rounded-2xl mb-8 md:mb-10">
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

                <div className="space-y-5 md:space-y-6">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-bold">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-green/50 px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-green/30" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-primary-green/5 border border-primary-green/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-primary-green placeholder:text-primary-green/20 focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-green/50 px-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-green/30" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-primary-green/5 border border-primary-green/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-12 text-primary-green placeholder:text-primary-green/20 focus:outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-medium text-sm md:text-base"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-primary-green/30 hover:text-primary-green/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full py-4 md:py-5 bg-primary-green text-cream font-bold rounded-xl md:rounded-2xl shadow-xl shadow-primary-green/20 hover:bg-sage transition-all duration-300 flex items-center justify-center gap-3 text-base md:text-lg mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Decrypting..." : (authMode === "login" ? "Enter Workspace" : "Create Account")}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="p-4 rounded-2xl bg-primary-green/20 border border-primary-green/30 flex items-center gap-4">
                  <ShieldCheck className="w-6 h-6 text-primary-green flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-primary-green text-sm">Neural Lock</h4>
                    <p className="text-[10px] md:text-xs text-primary-green/70">Anti-cheat proctoring.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-primary-green/20 border border-primary-green/30 flex items-center gap-4">
                  <Sparkles className="w-6 h-6 text-primary-green flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-primary-green text-sm">AI Synthesis</h4>
                    <p className="text-[10px] md:text-xs text-primary-green/70">Deep semantic analysis.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Frame Visual */}
            <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center order-1 md:order-2">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Girl */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: false }}
                  className="absolute z-10 w-[64%] md:w-[55%] h-auto"
                >
                  <img
                    src="/landing/Girl.png"
                    alt="Career Growth"
                    className="w-full h-auto filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
                  />
                </motion.div>

                {/* Frame */}
                <motion.div
                  initial={{ y: 20, opacity: 1 }}
                  whileInView={{ y: -30, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  viewport={{ once: false }}
                  className="absolute z-20 w-[95%] md:w-[85%] h-auto pointer-events-none flex items-center justify-center"
                >
                  <img
                    src="/landing/Frame.png"
                    alt="Framing Excellence"
                    className="w-full h-auto filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
                  />
                  {/* Tagline nested inside frame to scale perfectly */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="absolute bottom-[10%] md:bottom-[12%] left-0 right-0 text-center text-primary-green font-bold text-[11px] md:text-[16px] leading-relaxed uppercase tracking-[0.1em] md:tracking-[0.14em] z-30 pointer-events-auto px-10"
                  >
                    Unlock deep semantic insights,<br className="hidden md:block"/> real-time proctoring,<br className="hidden md:block"/> and strategic contribution mapping.
                  </motion.p>
                </motion.div>
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

"use client";

import React, { useState, useRef } from "react";
import { IngestionCanvas } from "@/components/IngestionCanvas";
import { SplitPerspectiveCharts } from "@/components/SplitPerspectiveCharts";
import { ScrollReveal } from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Zap, LayoutGrid, Sparkles, ChevronRight, Target, ArrowUpRight } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any, delay },
});

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any, delay },
});

export default function Home() {
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recruiterRequirements, setRecruiterRequirements] = useState("");

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setAnalysis(null);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const visionRes = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const visionData = await visionRes.json();
      if (visionData.error || !visionData.result) {
        throw new Error(visionData.error?.message || visionData.error || "Vision API failed");
      }
      const fullText = visionData.result.fullTextAnnotation?.text || "";

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          recruiterRequirements: recruiterRequirements.trim() || undefined,
        }),
      });
      const analyzeData = await analyzeRes.json();
      if (analyzeData.error) {
        throw new Error(analyzeData.error?.message || analyzeData.error || "Analysis failed");
      }

      setAnalysis(analyzeData.analysis);
      localStorage.setItem("current_resume_analysis", JSON.stringify(analyzeData.analysis));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <main className="relative pt-20 px-6 min-h-screen pb-16 flex flex-col gap-8 max-w-7xl mx-auto w-full z-10">

        {/* ── Hero Header ── */}
        <motion.header {...fadeUp(0.1)} className="mt-6 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Neural Intelligence Platform v2
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 pii-sensitive">
            <span className="shimmer-text">Resume</span>
            <span className="text-white">X-Ray</span>
          </h1>
          <p className="text-slate-400 text-base max-w-lg leading-relaxed">
            Upload a resume — our AI performs deep semantic extraction, ATS validation, and dual-perspective career analysis in seconds.
          </p>
        </motion.header>

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/8 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 backdrop-blur"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

          {/* ── Left Sidebar ── */}
          <motion.div {...fadeLeft(0.15)} className="lg:col-span-1 flex flex-col gap-5">

            {/* Ingestion Card */}
            <ScrollReveal direction="left" delay={100}>
              <section className="glass-card rounded-2xl p-6 flex flex-col min-h-[220px]">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1 h-5 rounded-full bg-cyan-400" />
                  <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Ingestion Canvas</h2>
                </div>
                <div className="flex-1 relative z-10">
                  <IngestionCanvas onAnalyze={processFile} />
                </div>
              </section>
            </ScrollReveal>

            {/* Recruiter Requirements */}
            <ScrollReveal direction="left" delay={180}>
              <motion.section {...fadeUp(0.2)} className="glass-card rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Recruiter Requirements</h3>
                </div>
                <textarea
                  value={recruiterRequirements}
                  onChange={(e) => setRecruiterRequirements(e.target.value)}
                  placeholder="Ex: Needs 3+ years in Rust, must be based in London, expert in HFT..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/30 min-h-[120px] resize-none transition-all placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-600 mt-2 italic">
                  Requirements weight the Recruiter Perspective analytics.
                </p>
              </motion.section>
            </ScrollReveal>

            {/* Power Score */}
            <ScrollReveal direction="left" delay={260}>
              <motion.section {...fadeUp(0.25)} className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1 h-5 rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Power Score
                  </h2>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center z-10">
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" />
                          <div className="absolute inset-2 rounded-full border border-emerald-500/10 animate-spin-slow" />
                        </div>
                        <p className="text-slate-500 text-sm animate-pulse font-medium">Computing semantics...</p>
                      </motion.div>
                    ) : analysis ? (
                      <motion.div
                        key="score"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="flex flex-col items-center w-full"
                      >
                        <div className="relative mb-4">
                          <div className="text-7xl font-black text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)] animate-text-glow tabular-nums">
                            {analysis.power_score || 0}
                          </div>
                          <div className="absolute -inset-6 bg-emerald-500/5 rounded-full blur-xl" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] text-center mb-8">
                          Semantic Match Index
                        </p>

                        <div className="w-full space-y-4">
                          {[
                            { label: "ATS Matches", value: analysis.ats_keywords?.length || 0, max: 10, color: "bg-cyan-500" },
                            { label: "Impact Phrases", value: analysis.recruiter_highlights?.length || 0, max: 5, color: "bg-amber-500" },
                          ].map((item) => (
                            <div key={item.label}>
                              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                <span>{item.label}</span>
                                <span className="font-bold text-slate-400">{item.value}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                  className={`h-full ${item.color} rounded-full`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 w-full grid grid-cols-2 gap-2">
                          <a href="/interview" className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-slate-400 border border-slate-800 rounded-xl hover:border-cyan-500/40 hover:text-cyan-400 transition-all">
                            Interview <ChevronRight className="w-3 h-3" />
                          </a>
                          <a href="/catalyst" className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-slate-400 border border-slate-800 rounded-xl hover:border-purple-500/40 hover:text-purple-400 transition-all">
                            Catalyst <Sparkles className="w-3 h-3" />
                          </a>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 text-center">
                        <div className="text-6xl font-black text-slate-800 tabular-nums">--</div>
                        <p className="text-slate-600 text-sm">Awaiting resume ingestion...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {analysis && (
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/8 blur-3xl rounded-full z-0 pointer-events-none" />
                )}
              </motion.section>
            </ScrollReveal>
          </motion.div>

          {/* ── Right: Perspective Analytics ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-5 z-10"
          >
            <section className="glass-card rounded-2xl p-6 flex-1 flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-purple-400" />
                  <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5" /> Dual-Perspective Analytics
                  </h2>
                </div>
                {analysis && (
                  <motion.a
                    href="/validation"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    Validate Skills <ArrowUpRight className="w-3 h-3" />
                  </motion.a>
                )}
              </div>

              <div className="flex-1 bg-slate-950/60 rounded-xl border border-slate-800/50 flex flex-col overflow-hidden shadow-inner shadow-black/50">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                      <div className="w-full max-w-sm space-y-3">
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative">
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                            initial={{ left: "-100%", width: "50%" }}
                            animate={{ left: "200%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        </div>
                        <p className="text-slate-500 text-sm text-center animate-pulse">
                          Running semantic extraction via Llama-4 Vision &amp; Analysis...
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                        {["OCR Parsing", "ATS Mapping", "Heuristics"].map((step, i) => (
                          <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex flex-col items-center gap-1 text-center"
                          >
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                            </div>
                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full overflow-y-auto">
                      {analysis.plain_english_summary && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-gradient-to-r from-cyan-500/5 to-transparent border-b border-slate-800/50 p-6"
                        >
                          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">The Real Talk</h3>
                          <p className="text-base text-slate-200 leading-relaxed font-medium italic">
                            &ldquo;{analysis.plain_english_summary}&rdquo;
                          </p>
                        </motion.div>
                      )}

                      <div className="p-6 space-y-8 overflow-y-auto">
                        {/* Bot vs Human */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* ATS View */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              What the Bots See
                            </h3>
                            <div className="space-y-1.5">
                              {analysis.ats_report?.matched_keywords?.map((k: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + i * 0.04 }}
                                  className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-xl border border-emerald-400/10 hover:border-emerald-400/20 transition-colors"
                                >
                                  <Zap className="w-3 h-3 shrink-0" /> Found: {k}
                                </motion.div>
                              ))}
                              {analysis.ats_report?.missing_keywords?.map((k: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + i * 0.04 }}
                                  className="flex items-center gap-2 text-xs text-red-400 bg-red-400/5 px-3 py-1.5 rounded-xl border border-red-400/10 opacity-70 hover:opacity-100 transition-opacity"
                                >
                                  <AlertCircle className="w-3 h-3 shrink-0" /> Missing: {k}
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Human View */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
                              What Recruiters Notice
                            </h3>
                            <div className="space-y-2">
                              {analysis.human_report?.high_impact_points?.map((p: string, i: number) => (
                                <motion.p
                                  key={i}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + i * 0.05 }}
                                  className="text-sm text-slate-300 border-l-2 border-amber-500/30 pl-3 py-1 hover:border-amber-500/60 transition-colors"
                                >
                                  {p}
                                </motion.p>
                              ))}
                              {analysis.human_report?.red_flags?.map((p: string, i: number) => (
                                <motion.p
                                  key={i}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + i * 0.05 }}
                                  className="text-sm text-red-400/80 italic pl-3 border-l-2 border-red-500/20"
                                >
                                  ⚠️ {p}
                                </motion.p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Prescription */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-6"
                        >
                          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" /> Fix These 3 Things
                          </h3>
                          <ul className="space-y-3">
                            {analysis.prescription?.map((step: string, i: number) => (
                              <motion.li
                                key={i}
                                initial={{ x: -12, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.12 }}
                                className="flex items-start gap-3 text-slate-300 group"
                              >
                                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 group-hover:bg-purple-500/30 transition-colors">
                                  {i + 1}
                                </div>
                                <span className="text-sm leading-relaxed">{step}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-700 mb-2">
                        <LayoutGrid className="w-8 h-8" />
                      </div>
                      <p className="text-slate-600 font-semibold">Awaiting Ingestion...</p>
                      <p className="text-slate-700 text-sm max-w-xs">Upload a resume to the Ingestion Canvas to begin dual-perspective semantic analysis.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
    </>
  );
}

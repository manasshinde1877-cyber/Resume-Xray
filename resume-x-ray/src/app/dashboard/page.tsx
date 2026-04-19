"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, Zap, LayoutGrid, Sparkles, ChevronRight, 
  Target, ArrowUpRight, History, Clock, FileText, Trash2, 
  Loader2, RefreshCw
} from "lucide-react";
import { IngestionCanvas } from "@/components/IngestionCanvas";
import { SplitPerspectiveCharts } from "@/components/SplitPerspectiveCharts";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/context/AuthContext";
import { uploadResumeAndSave, getUserResumes, ResumeAnalysis } from "@/lib/firebase/resumeServices";
import { auth, db } from "@/lib/firebase/config";
import { doc, deleteDoc } from "firebase/firestore";

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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recruiterRequirements, setRecruiterRequirements] = useState("");
  
  // History States
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setIsHistoryLoading(true);
      const data = await getUserResumes(user.uid);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this analysis record?")) return;
    try {
      await deleteDoc(doc(db, "resumes", id));
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const loadFromHistory = (item: ResumeAnalysis) => {
    setAnalysis(item.analysis);
    localStorage.setItem("current_resume_analysis", JSON.stringify(item.analysis));
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const processFile = async (file: File): Promise<void> => {
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

      // Persist to Firebase (only if logged in) — non-blocking, errors won't break UI
      if (user) {
        try {
          await uploadResumeAndSave(user.uid, file, analyzeData.analysis);
          fetchHistory();
        } catch (fbErr) {
          console.warn("Firebase save failed (non-critical):", fbErr);
        }
      }
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
        <motion.header {...fadeUp(0.1)} className="mt-6 mb-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-green/8 border border-primary-green/15 text-sage text-[10px] font-bold uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
              Neural Intelligence Platform v2
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3 pii-sensitive">
              <span className="shimmer-text">Resume</span>
              <span className="text-[#0d1408]">X-Ray</span>
            </h1>
            <p className="text-primary-green/60 text-base max-w-lg leading-relaxed">
              Upload a resume — our AI performs deep semantic extraction, ATS validation, and dual-perspective career analysis in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowHistory(true)}
               className="group relative px-6 py-3 rounded-2xl bg-white/80 border border-primary-green/20 text-primary-green font-bold text-xs uppercase tracking-widest hover:border-primary-green/40 hover:bg-primary-green/5 transition-all flex items-center gap-2.5 overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-green/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                Resume History
                {history.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-primary-green text-cream text-[9px]">
                    {history.length}
                  </span>
                )}
             </button>
          </div>
        </motion.header>

        {/* ── History Drawer ── */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-primary-green/5/80 backdrop-blur-sm z-[200]"
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-primary-green/20 z-[201] shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-primary-green/10 flex items-center justify-between bg-primary-green/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center text-sage">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Neural Archive</h2>
                      <p className="text-[10px] uppercase font-bold text-primary-green/60 tracking-tighter">Historical Semantic Data</p>
                    </div>
                  </div>
                  <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <AlertCircle className="w-5 h-5 rotate-45 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isHistoryLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">Accessing Vault...</span>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 text-center p-8">
                       <Clock className="w-12 h-12 opacity-20" />
                       <div>
                          <p className="font-bold text-slate-500">No records found</p>
                          <p className="text-xs mt-1">Your analyzed resumes will appear here automatically.</p>
                       </div>
                    </div>
                  ) : (
                    history.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative p-4 rounded-2xl bg-white border border-primary-green/5 hover:border-primary-green/30 hover:shadow-lg hover:shadow-primary-green/5 transition-all cursor-pointer overflow-hidden"
                        onClick={() => loadFromHistory(item)}
                      >
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-12 rounded-lg bg-primary-green/5 flex items-center justify-center text-primary-green/40 group-hover:text-sage group-hover:bg-primary-green/10 transition-colors">
                               <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{item.title}</h3>
                               <p className="text-[10px] text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-tighter">
                                  <Clock className="w-3 h-3" />
                                  {item.createdAt?.toDate().toLocaleDateString(undefined, { 
                                    month: 'short', day: 'numeric', year: 'numeric' 
                                  }) || "Just now"}
                               </p>
                               <div className="mt-3 flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-black">
                                    SCORE: {item.analysis.power_score}%
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase truncate">
                                    {item.analysis.ats_report?.matched_keywords?.length || 0} Bot Matches
                                  </span>
                               </div>
                            </div>
                            <button 
                              onClick={(e) => deleteHistoryItem(e, item.id!)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                <div className="p-6 bg-primary-green/5 border-t border-primary-green/10">
                   <p className="text-[10px] text-slate-500 leading-relaxed italic text-center">
                     All history is encrypted and linked securely to your workspace footprint.
                   </p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">

          {/* ── Left Sidebar ── */}
          <motion.div {...fadeLeft(0.15)} className="lg:col-span-1 flex flex-col gap-5">

            {/* Ingestion Card */}
            <ScrollReveal direction="left" delay={100}>
              <section className="bg-[#99AD7A] rounded-3xl p-6 flex flex-col min-h-[220px] shadow-xl shadow-black/5">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1 h-5 rounded-full bg-[#0d1408]" />
                  <h2 className="text-sm font-bold text-[#0d1408] uppercase tracking-widest">Ingestion Canvas</h2>
                </div>
                <div className="flex-1 relative z-10">
                  <IngestionCanvas onAnalyze={processFile} />
                </div>
              </section>
            </ScrollReveal>

            {/* Recruiter Requirements */}
            <ScrollReveal direction="left" delay={180}>
              <motion.section {...fadeUp(0.2)} className="bg-[#99AD7A] rounded-3xl p-6 flex flex-col shadow-xl shadow-black/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 rounded-full bg-[#0d1408]" />
                  <h3 className="text-sm font-bold text-[#0d1408] uppercase tracking-widest">Recruiter Requirements</h3>
                </div>
                <textarea
                  value={recruiterRequirements}
                  onChange={(e) => setRecruiterRequirements(e.target.value)}
                  placeholder="Ex: Needs 3+ years in Rust, must be London based..."
                  className="w-full bg-white/20 border border-black rounded-xl p-4 text-sm text-[#0d1408] focus:outline-none focus:ring-1 focus:ring-[#0d1408]/20 focus:border-[#0d1408]/20 min-h-[120px] resize-none transition-all placeholder:text-[#0d1408]/30"
                />
                <p className="text-[10px] text-[#0d1408]/60 mt-2 italic">
                  Requirements weight the Recruiter Perspective analytics.
                </p>
              </motion.section>
            </ScrollReveal>

            {/* Power Score */}
            <ScrollReveal direction="left" delay={260}>
              <motion.section {...fadeUp(0.25)} className="bg-[#99AD7A] rounded-3xl p-6 flex flex-col relative overflow-hidden flex-1 shadow-xl shadow-black/5">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1 h-5 rounded-full bg-[#0d1408]" />
                  <h2 className="text-sm font-bold text-[#0d1408] uppercase tracking-widest flex items-center gap-2">
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
                            { label: "ATS Matches", value: analysis.ats_keywords?.length || 0, max: 10, color: "bg-primary-green" },
                            { label: "Impact Phrases", value: analysis.recruiter_highlights?.length || 0, max: 5, color: "bg-amber-500" },
                          ].map((item) => (
                            <div key={item.label}>
                              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                <span>{item.label}</span>
                                <span className="font-bold text-primary-green/60">{item.value}</span>
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
                          <a href="/interview" className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-primary-green/60 border border-primary-green/20 rounded-xl hover:border-primary-green/40 hover:text-sage transition-all">
                            Interview <ChevronRight className="w-3 h-3" />
                          </a>
                          <a href="/catalyst" className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-primary-green/60 border border-primary-green/20 rounded-xl hover:border-purple-500/40 hover:text-tan transition-all">
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
            className="md:col-span-2 lg:col-span-2 flex flex-col gap-5 z-10"
          >
            <section className="bg-[#99AD7A] rounded-3xl p-6 flex-1 flex flex-col min-h-[600px] shadow-xl shadow-black/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-[#0d1408]" />
                  <h2 className="text-sm font-bold text-[#0d1408] uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5" /> Dual-Perspective Analytics
                  </h2>
                </div>
                {analysis && (
                  <motion.a
                    href="/validation"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-sage transition-colors"
                  >
                    Validate Skills <ArrowUpRight className="w-3 h-3" />
                  </motion.a>
                )}
              </div>

              <div className="flex-1 bg-white/20 rounded-xl border border-black flex flex-col overflow-hidden shadow-inner shadow-[#0d1408]/5">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                      <div className="w-full max-w-sm space-y-3">
                        <div className="h-1 bg-[#0d1408]/10 rounded-full overflow-hidden relative">
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#0d1408]/40 to-[#0d1408]/10 rounded-full"
                            initial={{ left: "-100%", width: "50%" }}
                            animate={{ left: "200%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        </div>
                        <p className="text-[#0d1408]/40 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">
                          Running semantic extraction via Neural Engine...
                        </p>
                      </div>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full overflow-y-auto">
                      {analysis.plain_english_summary && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white/30 border-b border-black p-6"
                        >
                          <h3 className="text-[10px] font-bold text-[#0d1408]/40 uppercase tracking-widest mb-2">The Real Talk</h3>
                          <p className="text-base text-[#0d1408] leading-relaxed font-medium italic">
                            &ldquo;{analysis.plain_english_summary}&rdquo;
                          </p>
                        </motion.div>
                      )}

                      <div className="p-6 space-y-8 overflow-y-auto">
                        {/* Comparison Charts */}
                        <div className="bg-white/40 border border-primary-green/10 rounded-2xl overflow-hidden">
                          <SplitPerspectiveCharts 
                            atsData={[
                              { name: "Keywords Found", value: analysis.ats_report?.matched_keywords?.length || 0 },
                              { name: "Keywords Missing", value: analysis.ats_report?.missing_keywords?.length || 0 },
                              { name: "PII Sanitized", value: analysis.pii_entities?.length || 0 },
                              { name: "Legacy Layout", value: 2 } // Mock value for layout complexity
                            ]}
                            recruiterData={[
                              { name: "Impact Points", value: analysis.human_report?.high_impact_points?.length || 0 },
                              { name: "Red Flags", value: analysis.human_report?.red_flags?.length || 0 },
                              { name: "Prescription Items", value: analysis.prescription?.length || 0 }
                            ]}
                          />
                        </div>

                        {/* Bot vs Human */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* ATS View */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-sage uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
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
                                  className="text-sm text-slate-700 border-l-2 border-amber-500/30 pl-3 py-1 hover:border-amber-500/60 transition-colors"
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
                          <h3 className="text-xs font-bold text-tan uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" /> Fix These 3 Things
                          </h3>
                          <ul className="space-y-3">
                            {analysis.prescription?.map((step: string, i: number) => (
                              <motion.li
                                key={i}
                                initial={{ x: -12, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.12 }}
                                className="flex items-start gap-3 text-slate-700 group"
                              >
                                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-tan flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 group-hover:bg-purple-500/30 transition-colors">
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
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-primary-green/20 flex items-center justify-center text-slate-700 mb-2">
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

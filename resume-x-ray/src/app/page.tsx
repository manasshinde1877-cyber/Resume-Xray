"use client";

import React, { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { IngestionCanvas } from "@/components/IngestionCanvas";
import { SplitPerspectiveCharts } from "@/components/SplitPerspectiveCharts";
import { motion } from "framer-motion";
import { AlertCircle, Zap, LayoutGrid } from "lucide-react";

export default function Home() {
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setAnalysis(null);

      // 1. Convert to Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Call Vision API (Llama 4 Vision fallback)
      const visionRes = await fetch('/api/vision', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 })
      });
      const visionData = await visionRes.json();

      if (visionData.error || !visionData.result) {
         throw new Error(visionData.error?.message || visionData.error || "Vision API failed");
      }

      const fullText = visionData.result.fullTextAnnotation?.text || "";

      // 3. Call Analyze API (categorical data)
      const analyzeRes = await fetch('/api/analyze', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText })
      });

      const analyzeData = await analyzeRes.json();
      if (analyzeData.error) {
        throw new Error(analyzeData.error?.message || analyzeData.error || "Analysis failed");
      }

      setAnalysis(analyzeData.analysis);
      
      // Persist for Interview Context
      localStorage.setItem('current_resume_analysis', JSON.stringify(analyzeData.analysis));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 px-6 min-h-screen pb-12 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <header className="mb-4">
          <h1 className="text-3xl font-bold pii-sensitive">Welcome, Recruiter</h1>
          <p className="text-slate-400 mt-2">Upload a resume to begin semantic perspective mapping.</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-6 relative">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Ingestion Canvas</h2>
              <div className="flex-1 relative z-10">
                <IngestionCanvas onAnalyze={processFile} />
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col relative overflow-hidden flex-1">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-400 z-10">
                <Zap className="w-5 h-5" /> Power Score
              </h2>
              <div className="flex-1 flex flex-col items-center justify-center z-10">
                {isProcessing ? (
                  <div className="animate-pulse flex flex-col items-center gap-2 pt-4">
                    <div className="w-20 h-20 bg-slate-800 rounded-full" />
                    <p className="text-slate-500 font-medium">Computing semantics...</p>
                  </div>
                ) : analysis ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div className="text-7xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                      {analysis.power_score || 0}
                    </div>
                    <p className="text-slate-400 mt-3 font-medium uppercase tracking-widest text-sm text-center px-4">
                      Semantic Match Index
                    </p>
                    
                    <div className="mt-8 w-full space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Verified ATS Matches</span>
                          <span>{analysis.ats_keywords?.length || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((analysis.ats_keywords?.length || 0) / 10) * 100, 100)}%` }} className="h-full bg-cyan-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Human Impact Phrases</span>
                          <span>{analysis.recruiter_highlights?.length || 0}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((analysis.recruiter_highlights?.length || 0) / 5) * 100, 100)}%` }} className="h-full bg-amber-500" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="text-6xl font-black text-slate-700">--</div>
                    <p className="text-slate-500 mt-4 text-center">Awaiting data...</p>
                  </>
                )}
              </div>
              {analysis && (
                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full z-0" />
              )}
            </section>
          </div>

          {/* Right Column: Perspective Analytics */}
          <div className="lg:col-span-2 flex flex-col gap-6 z-10">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 min-h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-400">
                  <LayoutGrid className="w-5 h-5" /> Dual-Perspective Analytics
                </h2>
              </div>
              
              <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/50 flex flex-col items-stretch justify-stretch overflow-hidden relative p-1 shadow-inner shadow-black/50 overflow-y-auto">
                {isProcessing ? (
                   <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      <div className="w-full max-w-sm h-1 bg-slate-800 rounded-full overflow-hidden relative">
                         <motion.div 
                           className="absolute left-0 top-0 bottom-0 bg-cyan-400"
                           initial={{ left: "-100%", width: "50%" }}
                           animate={{ left: "200%" }}
                           transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                         />
                      </div>
                      <p className="text-slate-500 animate-pulse">Running semantic extraction via Llama-4 Vision & Analysis...</p>
                   </div>
                ) : analysis ? (
                  <div className="flex flex-col h-full overflow-y-auto">
                    {analysis.plain_english_summary && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-cyan-500/5 border-b border-slate-800 p-6"
                      >
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-tighter mb-2">The Real Talk</h3>
                        <p className="text-lg text-slate-200 leading-relaxed font-medium italic">
                          "{analysis.plain_english_summary}"
                        </p>
                      </motion.div>
                    )}
                    
                    <div className="p-6 space-y-8">
                       {/* Row 1: Robot vs Human */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Bots Section */}
                          <div className="space-y-4">
                             <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                What the Bots See
                             </h3>
                             <div className="space-y-2">
                                {analysis.ats_report?.matched_keywords?.map((k: string, i: number) => (
                                   <div key={i} className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                                      <Zap className="w-3 h-3" /> Found: {k}
                                   </div>
                                ))}
                                {analysis.ats_report?.missing_keywords?.map((k: string, i: number) => (
                                   <div key={i} className="flex items-center gap-2 text-xs text-red-400 bg-red-400/5 px-3 py-1.5 rounded-full border border-red-400/10 opacity-70">
                                      <AlertCircle className="w-3 h-3" /> Missing: {k}
                                   </div>
                                ))}
                             </div>
                          </div>

                          {/* Humans Section */}
                          <div className="space-y-4">
                             <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                What Recruiters Notice
                             </h3>
                             <div className="space-y-3">
                                {analysis.human_report?.high_impact_points?.map((p: string, i: number) => (
                                   <p key={i} className="text-sm text-slate-300 border-l-2 border-amber-500/30 pl-3 py-1">
                                      {p}
                                   </p>
                                ))}
                                {analysis.human_report?.red_flags?.map((p: string, i: number) => (
                                   <p key={i} className="text-sm text-red-400/80 italic pl-3">
                                      ⚠️ {p}
                                   </p>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* Prescription Section */}
                       <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Fix These 3 Things</h3>
                          <ul className="space-y-3">
                             {analysis.prescription?.map((step: string, i: number) => (
                                <motion.li 
                                  key={i}
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start gap-3 text-slate-200"
                                >
                                   <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                      {i + 1}
                                   </div>
                                   <span className="text-sm">{step}</span>
                                </motion.li>
                             ))}
                          </ul>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-slate-600 font-medium">Awaiting Ingestion...</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

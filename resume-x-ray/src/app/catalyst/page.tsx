"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Terminal, Rocket, Flame, Target, MessageSquare, ChevronRight, Search, Activity, Sparkles, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GitHubIssue {
  id: number;
  title: string;
  repository_url: string;
  html_url: string;
  labels: { name: string }[];
  description?: string;
  rationale?: string;
  category?: "Skill Gap" | "Lacking Proof";
}

export default function ContributionCatalyst() {
  const [githubUser, setGithubUser] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [previousProjects, setPreviousProjects] = useState<any[]>([]);
  const [matchedIssues, setMatchedIssues] = useState<GitHubIssue[]>([]);
  const [activeStage, setActiveStage] = useState<"idle" | "syncing" | "matched">("idle");
  const [pitchIssue, setPitchIssue] = useState<GitHubIssue | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<{ strategy: string, comment: string } | null>(null);

  // Resume context for matching
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeGaps, setResumeGaps] = useState<string[]>([]);
  const [newTarget, setNewTarget] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('current_resume_analysis');
    if (saved) {
      const data = JSON.parse(saved);
      setResumeSkills(data.ats_report?.matched_keywords || []);
      setResumeGaps(data.ats_report?.missing_keywords || []);
    }
  }, []);

  const addTarget = () => {
    if (newTarget.trim() && !resumeGaps.includes(newTarget.trim())) {
      setResumeGaps(prev => [...prev, newTarget.trim()]);
      setNewTarget("");
    }
  };

  const removeTarget = (target: string) => {
    setResumeGaps(prev => prev.filter(t => t !== target));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setActiveStage("syncing");
    
    try {
      let repoList = "";
      if (githubUser) {
        // 1. Fetch GitHub Repos if username provided
        const repoRes = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=6`);
        const repos = await repoRes.json();
        setPreviousProjects(Array.isArray(repos) ? repos : []);
        repoList = Array.isArray(repos) ? repos.map((r: any) => r.name).join(", ") : "";
      } else {
        setPreviousProjects([]);
      }
      
      const gapQuery = resumeGaps.slice(0, 2).join(" ");
      
      // 2. Fetch Issues
      const searchRes = await fetch(`https://api.github.com/search/issues?q=${gapQuery}+label:"good first issue"+state:open&per_page=5`);
      const searchData = await searchRes.json();
      const rawIssues = searchData.items || [];

      // 3. AI Categorization & Rationale
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `
            ${githubUser ? `Candidate GitHub Repos: [${repoList}].` : "No GitHub profile provided."}
            Skills in Resume: [${resumeSkills.join(", ")}]. 
            Gaps to Solve: [${resumeGaps.join(", ")}].
            Analyze these issues: ${rawIssues.map((i: any) => i.title).join(" | ")}.
            ${githubUser ? "Assign each a category: 'Skill Gap' (missing) or 'Lacking Proof' (in resume but no repo evidence)." : "Assign each a category: 'Skill Gap'."}
            Provide a 1-sentence rationale for each why it will help the candidate.
            Respond ONLY with a JSON array: [{ "title": "...", "category": "...", "rationale": "..." }]`
          }]
        })
      });
      const aiData = await res.json();
      const enriched = JSON.parse(aiData.reply.replace(/```json/g, '').replace(/```/g, '').trim());

      const finalIssues = rawIssues.map((ri: any) => {
        const info = enriched.find((e: any) => e.title === ri.title) || { category: "Skill Gap", rationale: "Recommended based on tech stack." };
        return { ...ri, ...info };
      });
      
      setMatchedIssues(finalIssues);
      setActiveStage("matched");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGeneratePitch = async (issue: GitHubIssue) => {
    setPitchIssue(issue);
    setIsGeneratingPitch(true);
    setGeneratedPitch(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `I want to contribute to this GitHub issue: "${issue.title}". 
            Context: I have skills in [${resumeSkills.join(", ")}] but want to learn [${resumeGaps.join(", ")}].
            Generate:
            1. A 2-sentence contribution strategy (what code to look for).
            2. A professional PR pitch message to the maintainer.
            Respond ONLY with a JSON object: { "strategy": "...", "comment": "..." }`
          }]
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.reply.replace(/```json/g, '').replace(/```/g, '').trim());
      setGeneratedPitch(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <Navigation />

      <main className="pt-24 px-6 max-w-7xl mx-auto pb-20 overflow-hidden">
        <div className="relative mb-12 text-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
               <Flame className="w-4 h-4" /> Activating Contribution Catalyst
            </motion.div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              FUEL YOUR RESUME
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Bridge your skill gaps by solving real-world open problems. We scan your GitHub footprint and find the perfect "Next Step" for your career.
            </p>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-10 blur-sm">
               <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0.1 }}
                      animate={{ 
                        opacity: activeStage === "matched" && i % 3 === 0 ? 0.8 : 0.1,
                        backgroundColor: activeStage === "matched" && i % 3 === 0 ? "#06b6d4" : "transparent"
                      }}
                      className="w-4 h-4 rounded-sm border border-slate-800"
                    />
                  ))}
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <section className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Terminal className="w-32 h-32" />
                 </div>
                 
                 <h2 className="text-2xl font-bold flex items-center gap-2 mb-2 text-white">
                    <Terminal className="w-6 h-6 text-cyan-400" /> Connect Profile
                 </h2>
                 <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-bold">Optional Verification Suite</p>
                 
                 <div className="mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] leading-relaxed text-slate-400">
                    <span className="text-indigo-400 font-bold block mb-1 underline decoration-indigo-500/30">Why connect GitHub?</span>
                    Adding your username allows the <span className="text-slate-200">Neural Auditor</span> to cross-reference your actual code history against your resume. This unlocks the ability to identify <span className="text-amber-500 font-bold">Unverified Skills</span>—claims you've made that lack repo evidence.
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 focus-within:border-cyan-500/50 transition-all">
                       <input 
                         type="text" 
                         value={githubUser}
                         onChange={(e) => setGithubUser(e.target.value)}
                         placeholder="GitHub Username (Optional)" 
                         className="bg-transparent border-none outline-none w-full text-slate-200"
                       />
                    </div>
                    <p className="text-[9px] text-slate-500 text-center uppercase tracking-tighter">
                       {githubUser ? "Full Neural Audit Enabled" : "Connecting a profile enables 'Proof-Gap' verification"}
                    </p>
                 </div>

                 {/* Previous Projects Window */}
                 {previousProjects.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-800/50">
                       <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                          <LayoutGrid className="w-3 h-3" /> Project Repository History
                       </h3>
                       <div className="grid grid-cols-1 gap-2">
                          {previousProjects.map(repo => (
                             <div key={repo.id} className="p-3 rounded-xl bg-black/20 border border-slate-800/50 flex items-center justify-between group/repo">
                                <div className="overflow-hidden">
                                   <p className="text-[11px] font-bold text-slate-300 truncate">{repo.name}</p>
                                   <p className="text-[9px] text-slate-500 font-mono uppercase">{repo.language || "Terminal"}</p>
                                </div>
                                <a href={repo.html_url} target="_blank" className="opacity-0 group-hover/repo:opacity-100 transition-opacity">
                                   <ChevronRight className="w-3 h-3 text-cyan-400" />
                                </a>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* Simulated Heatmap */}
                 <div className="mt-8 pt-8 border-t border-slate-800/50">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Manual Contribution Scan</p>
                    <div className="flex gap-1 flex-wrap">
                       {Array.from({ length: 42 }).map((_, i) => (
                         <motion.div 
                           key={i}
                           animate={{ 
                             backgroundColor: activeStage === "syncing" && i % 2 === 0 ? "#06b6d4" : 
                                            activeStage === "matched" && i % 4 === 0 ? "#14b8a6" : "#1e293b" 
                           }}
                           className="w-4 h-4 rounded-[2px]"
                         />
                       ))}
                    </div>
                 </div>
              </div>

              <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-purple-400 font-bold text-sm flex items-center gap-2">
                       <Target className="w-4 h-4" /> Catalyst Targets
                    </h3>
                    <button 
                       onClick={handleSync}
                       disabled={isSyncing || resumeGaps.length === 0}
                       className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition"
                       title="Refresh Audit"
                    >
                       <Activity className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                 </div>

                 <div className="flex flex-wrap gap-2 mb-4">
                    {resumeGaps.map(gap => (
                      <motion.span 
                        key={gap} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] rounded-full font-mono uppercase"
                      >
                         {gap}
                         <button 
                           onClick={() => removeTarget(gap)}
                           className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                         >
                           ✕
                         </button>
                      </motion.span>
                    ))}
                    {resumeGaps.length === 0 && (
                      <p className="text-[10px] text-slate-600 italic">No targets defined.</p>
                    )}
                 </div>

                 <div className="flex gap-2">
                    <input 
                       type="text"
                       value={newTarget}
                       onChange={(e) => setNewTarget(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && addTarget()}
                       placeholder="Add custom tech gap..."
                       className="flex-1 bg-black/40 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-slate-300 outline-none focus:border-purple-500/50 transition-all"
                    />
                    <button 
                       onClick={addTarget}
                       className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition"
                    >
                       + ADD
                    </button>
                 </div>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing || resumeGaps.length === 0}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-cyan-900/20 disabled:opacity-50 flex items-center justify-center gap-3 border border-white/10"
              >
                {isSyncing ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" /> {githubUser ? "Mapping Neural Footprint..." : "Fetching Opportunities..."}
                  </>
                ) : (
                  <>
                    {githubUser ? <Rocket className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                    {githubUser ? "Launch Neural Audit" : "Find Related Issues"}
                  </>
                )}
              </button>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
                 <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Neural Audit Methodology
                 </h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-cyan-400">1. Repository Architecture Scan</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed">Analyzing your 6 most recent repos to map your actual language stack & project domains.</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-amber-500">2. Comparative Proof Audit</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed">Cross-referencing Resume claims vs. GitHub reality to identify "Unverified" skills.</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-purple-400">3. Live Ecosystem Mapping</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed">Querying the GitHub Search API for live 'good-first-issues' matching your specific gaps.</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-white">4. Strategic Rationale</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed">Generating precise entry plans to maximize your resume's hireability impact.</p>
                    </div>
                 </div>
              </div>
           </section>

           <section className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl min-h-[600px] flex flex-col">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                       <Target className="w-6 h-6 text-purple-400" /> Open Opportunities
                    </h2>
                    {activeStage === "matched" && (
                       <span className="text-[10px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> MATCHED TO SKILL GAPS
                       </span>
                    )}
                 </div>

                 <AnimatePresence mode="wait">
                    {activeStage === "idle" && (
                       <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
                       >
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                             <Search className="w-8 h-8" />
                          </div>
                          <p className="text-xl font-bold text-slate-500">Awaiting Signal</p>
                          <p className="text-sm text-slate-600 max-w-xs">Connecting to your GitHub will allow the Catalyst to bridge your resume to live open source problems.</p>
                       </motion.div>
                    )}

                    {activeStage === "syncing" && (
                       <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                       >
                          <div className="relative">
                             <motion.div 
                               animate={{ rotate: 360 }}
                               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                               className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-500/30"
                             />
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                             </div>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-cyan-400">Mining Contributions</p>
                            <p className="text-sm text-slate-500">Mapping your unique neural footprint onto repository structures...</p>
                          </div>
                       </motion.div>
                    )}

                    {activeStage === "matched" && (
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="space-y-4"
                       >
                          {matchedIssues.map((issue) => (
                             <motion.div 
                                key={issue.id}
                                whileHover={{ x: 10 }}
                                className="group p-5 rounded-2xl bg-black/40 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-4"
                             >
                                <div className="space-y-3 flex-1">
                                   <div className="flex items-center gap-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                         issue.category === 'Lacking Proof' 
                                         ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                         : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                      }`}>
                                         {issue.category}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                                         {issue.repository_url.split('/').slice(-2).join('/')}
                                      </span>
                                   </div>
                                   <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors leading-tight">
                                      {issue.title}
                                   </h3>
                                   <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-slate-800 pl-3">
                                      {issue.rationale}
                                   </p>
                                   <div className="flex gap-2 pt-1">
                                      {issue.labels.slice(0, 2).map(l => (
                                        <span key={l.name} className="px-2 py-0.5 rounded bg-slate-800 text-[9px] text-slate-500 font-medium">
                                          #{l.name}
                                        </span>
                                      ))}
                                   </div>
                                </div>
                                <button 
                                  onClick={() => handleGeneratePitch(issue)}
                                  className="shrink-0 p-3 rounded-xl bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all border border-cyan-500/20 mt-2"
                                >
                                   <ChevronRight className="w-5 h-5" />
                                </button>
                             </motion.div>
                          ))}
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </section>
        </div>

        <AnimatePresence>
           {pitchIssue && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPitchIssue(null)}
                  className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl z-10"
                >
                   <button 
                     onClick={() => setPitchIssue(null)}
                     className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                   >
                     ✕
                   </button>
                   
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                         <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-bold">One-Click PR Pitch</h2>
                         <p className="text-sm text-slate-400">Strategic entry plan for {pitchIssue.title}</p>
                      </div>
                   </div>

                   {isGeneratingPitch ? (
                     <div className="space-y-6 py-10">
                        <div className="h-4 bg-slate-800 rounded-full animate-pulse w-3/4" />
                        <div className="h-4 bg-slate-800 rounded-full animate-pulse w-1/2" />
                        <div className="h-32 bg-slate-800 rounded-2xl animate-pulse" />
                     </div>
                   ) : generatedPitch && (
                     <div className="space-y-8">
                        <div>
                           <h4 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" /> Contribution Strategy
                           </h4>
                           <div className="bg-black/40 border border-slate-800 p-5 rounded-2xl text-slate-300 leading-relaxed italic border-l-4 border-l-cyan-500">
                             "{generatedPitch.strategy}"
                           </div>
                        </div>

                        <div>
                           <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-3 h-3" /> Professional Pitch
                              </h4>
                              <button 
                                onClick={() => navigator.clipboard.writeText(generatedPitch.comment)}
                                className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                              >
                                 COPY TEXT
                              </button>
                           </div>
                           <pre className="bg-slate-950 p-6 rounded-2xl text-xs font-mono text-slate-300 whitespace-pre-wrap border border-slate-800">
                              {generatedPitch.comment}
                           </pre>
                        </div>

                        <div className="flex gap-4">
                           <a 
                             href={pitchIssue.html_url}
                             target="_blank"
                             className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-center transition shadow-lg shadow-cyan-900/40"
                           >
                             GO TO ISSUE
                           </a>
                           <button 
                             onClick={() => setPitchIssue(null)}
                             className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition"
                           >
                             DONE
                           </button>
                        </div>
                     </div>
                   )}
                </motion.div>
             </div>
           )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

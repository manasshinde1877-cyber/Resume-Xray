"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Code, Terminal, Zap, CheckCircle2 } from "lucide-react";

export default function ValidationArena() {
  const [projectIdea, setProjectIdea] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const generateProject = async () => {
    setIsGenerating(true);
    setProjectIdea(null);
    setFeedback(null);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Generate a short, intense advanced 15-minute coding challenge to test a candidate's React and TypeScript skills. Keep the prompt under 3 sentences." }]
        })
      });
      const data = await res.json();
      setProjectIdea(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateCode = async () => {
    setIsValidating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Evaluate the following code based on the prompt: '${projectIdea}'. Code: ${code}. Be extremely critical like an elite Staff Engineer. Keep response under 4 sentences.` }]
        })
      });
      const data = await res.json();
      setFeedback(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 px-6 min-h-screen pb-12 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Validation Arena</h1>
          <p className="text-slate-400 mt-2">Dynamic skill-gap generation & code validation.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-400">
              <Zap className="w-5 h-5" /> Dynamic Project Generator
            </h2>
            
            <div className="bg-slate-950 rounded-xl p-4 min-h-[150px] border border-slate-800 flex items-center justify-center">
              {isGenerating ? (
                <p className="text-slate-500 animate-pulse">Detecting skill gaps...</p>
              ) : projectIdea ? (
                <p className="text-slate-300 leading-relaxed text-sm">
                  {projectIdea}
                </p>
              ) : (
                <p className="text-slate-600">No project generated.</p>
              )}
            </div>
            
            <button 
              onClick={generateProject}
              disabled={isGenerating}
              className="mt-6 w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              Generate Skill-Gap Challenge
            </button>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[400px]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-400">
              <Code className="w-5 h-5" /> Code & Validate
            </h2>
            
            <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-800">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-slate-500" />
                 <span className="text-xs text-slate-500 font-mono">solution.tsx</span>
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Write your elite solution here..."
                className="flex-1 bg-slate-950 text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <button 
              onClick={validateCode}
              disabled={isValidating || !code || !projectIdea}
              className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition disabled:opacity-50 flex justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> 
              {isValidating ? "Evaluating Code..." : "Submit to Validation Engine"}
            </button>

            {feedback && (
              <div className="mt-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-sm text-slate-300 leading-relaxed break-words">{feedback}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

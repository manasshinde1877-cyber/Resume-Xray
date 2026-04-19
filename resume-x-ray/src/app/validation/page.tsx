"use client";

import React, { useState, useEffect, useRef } from "react";
import { Code, Terminal, Zap, CheckCircle2, Fingerprint, Activity, AlertCircle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ValidationArena() {
  const [projectIdea, setProjectIdea] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const mountedRef = useRef(false);

  const requestHint = async () => {
    if (!projectIdea || isGettingHint) return;
    setIsGettingHint(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: `Candidate is struggling with this challenge: '${projectIdea}'. Give them a subtle, extremely short technical hint (max 1 sentence). DO NOT solve it. Skip preamble.` 
          }]
        })
      });
      const data = await res.json();
      setHints(prev => [...prev, data.reply]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGettingHint(false);
    }
  };

  // Behavioral Monitoring
  const [systemWarning, setSystemWarning] = useState<string | null>(null);
  const [lastTyped, setLastTyped] = useState(Date.now());
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [keystrokeCount, setKeystrokeCount] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isLockedIn) return;
    setKeystrokeCount(prev => prev + 1);
    setLastTyped(Date.now());
    if (e.key === 'Backspace') {
      setBackspaceCount(prev => prev + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!isLockedIn) return;
    setSystemWarning("⚠️ AUTHORSHIP ANOMALY: Large block pasted. We track your unique neural signature.");
    setTimeout(() => setSystemWarning(null), 5000);
  };

  // Activity & Backspace Watcher
  useEffect(() => {
    if (!isLockedIn) return;
    const interval = setInterval(() => {
      // Inactivity check
      if (Date.now() - lastTyped > 30000 && code.length > 0 && !isValidating) {
        setSystemWarning("💡 BRAIN FREEZE? You can request a technical hint.");
      }
      
      // High Backspace Check
      if (keystrokeCount > 50 && (backspaceCount / keystrokeCount) > 0.3) {
        setSystemWarning("📉 STRUGGLING? High backspace frequency detected. Refactor your approach. You may take hints");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastTyped, code.length, isValidating, keystrokeCount, backspaceCount]);

  useEffect(() => {
    if (systemWarning) {
      const timer = setTimeout(() => setSystemWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [systemWarning]);

  // Proctoring States
  const [proctorStatus, setProctorStatus] = useState<"active" | "warning" | "missing">("active");
  const [proctorWarning, setProctorWarning] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const proctorIntervalRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api models on mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLockedIn) {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }
    let faceapi: any;
    const loadModels = async () => {
      faceapi = await import('face-api.js');
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      startProctoring(faceapi);
    };
    loadModels();
    return () => {
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLockedIn]);

  const startProctoring = async (faceapi: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (!mountedRef.current || !isLockedIn) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          if (err.name !== "AbortError") console.error("Video play failed", err);
        });
      }

      proctorIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
           ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
           if (detections) {
              const landmarks = detections.landmarks.positions;

              // Check looking away
              const eyeL = landmarks[36];
              const eyeR = landmarks[45];
              const nose = landmarks[30];
              const ratio = Math.abs(nose.x - eyeL.x) / Math.abs(nose.x - eyeR.x);

              if (ratio < 0.4 || ratio > 2.5) {
                 setProctorStatus("warning");
                 setProctorWarning("Look at the screen.");
              } else {
                 setProctorStatus("active");
                 setProctorWarning("");
              }
           } else {
              setProctorStatus("missing");
              setProctorWarning("Candidate missing.");
           }
        }
      }, 800);
    } catch (err) {
      console.error("Proctoring failed", err);
    }
  };

  // Timer Effect
  React.useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateProject = async () => {
    setIsGenerating(true);
    setProjectIdea(null);
    setFeedback(null);
    setTimeLeft(null);
    setHints([]);
    
    try {
      // Retrieve resume context for relevance
      const saved = localStorage.getItem('current_resume_analysis');
      const analysisContext = saved ? JSON.parse(saved) : null;
      const skills = analysisContext?.ats_report?.matched_keywords?.join(", ") || "software engineering";
      const gaps = analysisContext?.ats_report?.missing_keywords?.join(", ") || "distributed systems";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: `You are a Technical Lead. Generate a HARD, SPECIFIC coding challenge for a candidate skilled in [${skills}] but missing depth in [${gaps}]. 
            Focus on internal implementation (e.g., 'Implement a custom rate-limiter with a sliding window in raw TypeScript' or 'Build a simplified virtual DOM reconciliation engine').
            Respond ONLY with a JSON object: { \"challenge\": \"...\", \"time_minutes\": number }. 
            The challenge should be exactly 2 technical sentences.` 
          }]
        })
      });
      const data = await res.json();
      
      // Attempt to parse JSON from AI response
      let parsed;
      try {
        const cleaned = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { challenge: data.reply, time_minutes: 20 };
      }

      setProjectIdea(parsed.challenge);
      setTimeLeft(parsed.time_minutes * 60);
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
      setTimeLeft(null); // Stop timer on submission
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <main className="pt-20 px-6 min-h-screen pb-12 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sage">Validation Arena</h1>
            <p className="text-primary-green/60 mt-2">Dynamic skill-gap generation & code validation.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsLockedIn(!isLockedIn)}
            className={`px-6 py-3 rounded-xl border-2 transition-all flex items-center gap-3 font-bold uppercase tracking-widest text-xs ${
              isLockedIn 
                ? 'bg-primary-green/20 border-primary-green text-sage shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : 'bg-white/80 border-primary-green/20 text-slate-500 hover:border-slate-700'
            }`}
          >
            <Shield className={`w-4 h-4 ${isLockedIn ? 'animate-pulse' : ''}`} />
            {isLockedIn ? "Neural Lock: ENABLED (click to disable)" : "Neural Lock: DISABLED (click to enable)"}
          </motion.button>
        </header>

        {/* Proctoring Monitor - Fixed to Top Center */}
        {isLockedIn && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-64 h-18 rounded-full overflow-hidden border-2 bg-white/80/80 shadow-2xl transition-colors pointer-events-auto backdrop-blur-xl flex items-center px-4 gap-4 ${proctorStatus === 'active' ? 'border-primary-green/30' : 'border-red-500 ring-4 ring-red-500/20'}`}
          >
             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-green/30 shrink-0 relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" width={64} height={64} />
             </div>
             
             <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                   <span className="text-[8px] font-bold font-mono text-sage uppercase tracking-widest">Neural Proctor</span>
                   <div className={`w-1.5 h-1.5 rounded-full ${proctorStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
                </div>
                <p className="text-[7px] text-primary-green/60 font-mono truncate">
                   {proctorWarning ? `⚠️ ${proctorWarning}` : "Presence Verified"}
                </p>
             </div>
          </motion.div>
        </div>
        )}

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">

          <section className="bg-white/80 border border-primary-green/20 rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-tan">
              <Zap className="w-5 h-5" /> Dynamic Project Generator
            </h2>
            
            <div className="bg-primary-green/5 rounded-xl p-4 min-h-[150px] border border-primary-green/20 flex flex-col justify-center">
              {isGenerating ? (
                <p className="text-slate-500 animate-pulse text-center">Detecting skill gaps...</p>
              ) : projectIdea ? (
                <>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {projectIdea}
                  </p>
                  {hints.length > 0 && (
                    <div className="mt-4 space-y-2">
                       {hints.map((h, i) => (
                         <div key={i} className="bg-tan/10 border border-tan/20 p-2 rounded-lg text-[11px] text-purple-300 italic">
                            💡 Hint {i+1}: {h}
                         </div>
                       ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-600 text-center">No project generated.</p>
              )}
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={generateProject}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-primary-green hover:bg-tan text-[#0d1408] rounded-lg font-semibold transition disabled:opacity-50"
              >
                Generate Skill-Gap Challenge
              </button>

              {projectIdea && !feedback && (
                <button 
                  onClick={requestHint}
                  disabled={isGettingHint}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-tan rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Activity className="w-4 h-4" />
                  {isGettingHint ? "Consulting Documentation..." : "Request Technical Hint"}
                </button>
              )}
            </div>
          </section>

          <section className={`bg-white/80 border border-primary-green/20 rounded-2xl p-6 flex flex-col gap-4 transition-opacity ${!isLockedIn ? 'opacity-50' : ''}`}>
             <h2 className="text-xl font-semibold flex items-center gap-2 text-sage">
                <Fingerprint className="w-5 h-5" /> Behavioral Monitor
             </h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-green/5/50 border border-primary-green/20 p-4 rounded-xl">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Activity</p>
                   <p className={`text-sm font-mono ${isLockedIn && Date.now() - lastTyped < 5000 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {!isLockedIn ? "Paused" : (Date.now() - lastTyped < 5000 ? "Active" : "Idle")}
                   </p>
                </div>
                <div className="bg-primary-green/5/50 border border-primary-green/20 p-4 rounded-xl">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Deletion Ratio</p>
                   <p className="text-sm font-mono text-cyan-300">
                      {!isLockedIn ? "--" : (keystrokeCount > 0 ? ((backspaceCount / keystrokeCount) * 100).toFixed(0) + "%" : "0%")}
                   </p>
                </div>
                <div className="bg-primary-green/5/50 border border-primary-green/20 p-4 rounded-xl col-span-2">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Neural Flow Status</p>
                   <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${!isLockedIn ? 'bg-slate-700' : (systemWarning ? 'bg-red-500 animate-ping' : 'bg-primary-green animate-pulse')}`} />
                      <span className="text-xs text-primary-green/60 font-mono">
                         {!isLockedIn ? "Neural Lock Required" : (systemWarning ? "Authorship Flagged" : "Monitoring Signature...")}
                      </span>
                   </div>
                </div>
             </div>
          </section>

          <section className="bg-white/80 border border-primary-green/20 rounded-2xl p-6 flex flex-col min-h-[650px] md:col-start-2 md:col-span-2 md:row-start-1 md:row-span-2 relative">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-400">
              <Code className="w-5 h-5" /> Code & Validate
            </h2>

            <AnimatePresence>
              {systemWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-16 left-6 right-6 z-50 bg-red-500 text-[#0d1408] p-3 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20"
                >
                   <AlertCircle className="w-4 h-4" />
                   {systemWarning}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-primary-green/20">
              <div className="bg-primary-green/5 px-4 py-2 border-b border-primary-green/20 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500 font-mono">solution.tsx</span>
                 </div>
                 {timeLeft !== null && (
                    <div className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-primary-green/10 text-sage'}`}>
                       Time Remaining: {formatTime(timeLeft)}
                    </div>
                 )}
              </div>
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="// Write your elite solution here..."
                className="flex-1 bg-primary-green/5 text-slate-700 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-green/50"
              />
            </div>

            <button 
              onClick={validateCode}
              disabled={isValidating || !code || !projectIdea}
              className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-[#0d1408] rounded-lg font-semibold transition disabled:opacity-50 flex justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> 
              {isValidating ? "Evaluating Code..." : "Submit to Validation Engine"}
            </button>

            {feedback && (
              <div className="mt-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-sm text-slate-700 leading-relaxed break-words">{feedback}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

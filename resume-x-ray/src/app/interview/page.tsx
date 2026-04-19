"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, User, Bot, Shield, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Local Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function InterviewPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useLocalSTT, setUseLocalSTT] = useState(true);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mountedRef = useRef(false);

  // Proctoring States
  const [isLockedIn, setIsLockedIn] = useState(false);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        if (!videoRef.current || !canvasRef.current || !isLockedIn) return;

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        if (detections.length === 0) {
          setProctorStatus("missing");
          setProctorWarning("Candidate presence lost");
        } else if (detections.length > 1) {
          setProctorStatus("warning");
          setProctorWarning("Multiple persons detected");
        } else {
          setProctorStatus("active");
          setProctorWarning("");
        }
      }, 1500);

    } catch (err) {
      console.error("Proctoring failed:", err);
      setProctorStatus("missing");
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm the ResumeX-Ray AI Recruiter. I've reviewed your resume semantics. Could you tell me about the most challenging project you've worked on recently?" }
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dynamic Greeting based on Resume Context
  useEffect(() => {
    const context = localStorage.getItem('current_resume_analysis');
    if (context) {
      const parsed = JSON.parse(context);
      // Generate a dynamic opening based on the power score or keywords
      const initialPrompt = `Generate a very harsh, skeptical 1-sentence opening interview question based on this resume analysis: ${JSON.stringify(parsed)}. Address them as a candidate and pin-point a specific skill or highlight from their resume to challenge.`;

      const fetchGreeting = async () => {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: initialPrompt }],
            resumeContext: parsed
          })
        });
        const data = await res.json();
        if (data.reply) {
          setMessages([{ role: "assistant", content: data.reply }]);
          speakText(data.reply);
        }
      };
      fetchGreeting();
    } else {
      speakText(messages[0].content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab Visibility & Unmount Silencing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        window.speechSynthesis.cancel();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // HARD SILENCE on page transition/unmount
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!window.speechSynthesis || document.visibilityState === 'hidden') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // try to find a natural english voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Samantha")) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      window.speechSynthesis.cancel();
      setInterimText("");

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Local Speech Recognition is not supported in this browser. Try Chrome or Edge.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          final += event.results[i][0].transcript;
        }
        setInterimText(final);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);

      // Volume tracking for visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((src, val) => src + val, 0) / dataArray.length;
        setVolume(average);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

    } catch (err) {
      console.error(err);
      alert("Please allow mic access.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setVolume(0);

      // Trigger AI with the transcript finalized so far
      // Note: In toggle mode, we check text after state change
    }
  };

  // Effect to handle submission when recording is explicitly stopped
  useEffect(() => {
    if (!isRecording && interimText.trim() && !isProcessing) {
      handleFinalTranscript(interimText.trim());
    }
  }, [isRecording]);

  const handleFinalTranscript = async (userText: string) => {
    setIsProcessing(true);
    try {
      const newMessages: Message[] = [...messages, { role: "user", content: userText }];
      setMessages(newMessages);

      const resumeContext = localStorage.getItem('current_resume_analysis');

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.slice(-10),
          resumeContext: resumeContext ? JSON.parse(resumeContext) : null
        }),
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.error);

      const aiText = chatData.reply;
      setMessages([...newMessages, { role: "assistant", content: aiText }]);
      speakText(aiText);
    } catch (err: any) {
      console.error(err);
      alert("Failed to process chat");
    } finally {
      setIsProcessing(false);
      setInterimText("");
    }
  };

  const [textInput, setTextInput] = useState("");

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing) {
      handleFinalTranscript(textInput.trim());
      setTextInput("");
    }
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }}
        className="pt-20 px-6 min-h-screen pb-12 flex flex-col gap-6 max-w-5xl mx-auto w-full relative z-10"
      >
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-4 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Live Session
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Agentic Interview</h1>
            <p className="text-slate-400 mt-1 text-sm">Real-time voice &amp; text verification module.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsLockedIn(!isLockedIn)}
            className={`px-5 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2.5 font-bold uppercase tracking-widest text-xs ${
              isLockedIn
                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
            }`}
          >
            <Shield className={`w-4 h-4 ${isLockedIn ? 'animate-pulse' : ''}`} />
            {isLockedIn ? "Neural Lock: ENABLED (click to disable)" : "Neural Lock: DISABLED (click to enable)"}
          </motion.button>
        </motion.header>

        {/* Proctoring Monitor - Fixed to Top Center */}
        {isLockedIn && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-48 h-12 rounded-full overflow-hidden border-2 bg-slate-900/80 shadow-2xl transition-colors pointer-events-auto backdrop-blur-xl flex items-center px-4 gap-3 ${proctorStatus === 'active' ? 'border-cyan-500/30' : 'border-red-500 ring-4 ring-red-500/20'}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                <video ref={videoRef} className="w-full h-full object-cover grayscale opacity-70" muted playsInline />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" width={40} height={40} />
              </div>

              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold font-mono text-cyan-400 uppercase tracking-widest">Neural Proctor</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${proctorStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
                </div>
                <p className="text-[7px] text-slate-400 font-mono truncate">
                  {proctorWarning ? `⚠️ ${proctorWarning}` : "Presence Verified"}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative shadow-2xl shadow-cyan-500/5"
        >
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/10">
                    <Bot className="w-6 h-6" />
                  </div>
                )}

                <div className={`max-w-[75%] p-4 rounded-2xl pii-sensitive ${m.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-sm shadow-lg shadow-cyan-900/20'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                  }`}>
                  <p className="leading-relaxed text-sm md:text-base">{m.content}</p>
                </div>

                {m.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="max-w-[70%] p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/10 text-slate-400 rounded-tl-sm flex items-center italic text-sm">
                  Skeptical Staff Engineer is processing...
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controller */}
          <div className="p-6 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex flex-col gap-6">
            <AnimatePresence>
              {isRecording && interimText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-cyan-400 text-sm italic text-center w-full bg-cyan-500/5 py-2 rounded-lg border border-cyan-500/10"
                >
                  "{interimText}..."
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 w-full">
              {/* Voice Toggle */}
              <div className="relative group flex items-center justify-center w-14 h-14">
                {/* Neural Orb */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: 1 + (volume / 50),
                        opacity: 0.3 + (volume / 100),
                        filter: `blur(${10 + (volume / 5)}px)`,
                        background: `radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(168,85,247,0.5) 50%, rgba(236,72,153,0) 100%)`
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 rounded-full z-0"
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  animate={{
                    scale: isRecording ? 1.05 : 1,
                    boxShadow: isRecording
                      ? `0 0 ${20 + volume}px rgba(6, 182, 212, 0.4)`
                      : `0 0 0px rgba(6, 182, 212, 0)`
                  }}
                  className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${isRecording
                      ? 'bg-slate-900 border-2 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 shadow-lg'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {isRecording ? <div className="w-4 h-4 rounded-sm bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" /> : <Mic className="w-6 h-6" />}
                </motion.button>
              </div>

              {/* Text Entry */}
              <form
                onSubmit={handleTextSubmit}
                className="flex-1 flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-2 focus-within:border-cyan-500/50 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your response here..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 py-2"
                  disabled={isProcessing || isRecording}
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing || isRecording}
                  className="p-2 rounded-xl bg-cyan-600 text-white disabled:opacity-0 disabled:scale-90 transition-all hover:bg-cyan-500 active:scale-95"
                >
                  <Volume2 className="w-5 h-5 rotate-90" /> {/* Using Volume2 as a stylized send icon */}
                </button>
              </form>
            </div>

            <div className="flex justify-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                {isRecording ? "Listening on Device..." : isProcessing ? "Evaluating Response..." : "Hybrid Voice/Text Entry Enabled"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.main>
    </>
  );
}

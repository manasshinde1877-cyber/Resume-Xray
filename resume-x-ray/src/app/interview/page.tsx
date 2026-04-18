"use client";

import React, { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Mic, Square, Loader2, Volume2, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Local Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
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
  const [useLocalSTT, setUseLocalSTT] = useState(true); // Default to local for speed
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
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

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
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

      rec.onend = () => {
         // Process text when rec stops
         if (isRecording) {
            // If it ended unexpectedly while button is down
         }
      };

      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);

      // Volume tracking for visualizer still needs mic stream
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

      // Trigger AI with the transcript we gathered
      if (interimText.trim()) {
        handleFinalTranscript(interimText.trim());
      }
    }
  };

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

  return (
    <>
      <Navigation />
      <main className="pt-20 px-6 min-h-screen pb-12 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-cyan-400">Agentic Interview</h1>
          <p className="text-slate-400 mt-2">Real-time voice verification module powered by Groq Whisper & LLaMA 3.</p>
        </header>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden relative">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                )}
                
                <div className={`max-w-[70%] p-4 rounded-2xl pii-sensitive ${
                  m.role === 'user' 
                    ? 'bg-slate-800 text-slate-100 rounded-tr-sm' 
                    : 'bg-cyan-950/30 border border-cyan-500/20 text-slate-200 rounded-tl-sm'
                }`}>
                  <p className="leading-relaxed">{m.content}</p>
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
                  <div className="max-w-[70%] p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-slate-400 rounded-tl-sm flex items-center">
                    Agent is thinking...
                  </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controller */}
          <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex justify-center items-center">
             <div className="flex flex-col items-center gap-4 w-full">
                <AnimatePresence>
                  {isRecording && interimText && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-cyan-400 text-sm italic text-center max-w-sm"
                    >
                      "{interimText}..."
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isProcessing}
                  animate={{ 
                    scale: isRecording ? 1 + (volume / 100) : 1,
                    boxShadow: isRecording 
                      ? `0 0 ${20 + volume}px rgba(239, 68, 68, 0.6)` 
                      : `0 0 15px rgba(6, 182, 212, 0.4)`
                  }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed cursor-wait' : ''}`}
                >
                  {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-white" />}
                </motion.button>
                <p className="text-slate-400 text-sm font-medium">
                  {isRecording ? "Release to Send" : "Hold to Speak"}
                </p>
             </div>
             
             {isRecording && (
                <div className="absolute right-8 bottom-12 flex items-center gap-2 text-red-500">
                   <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-sm font-medium animate-pulse">Recording...</span>
                </div>
             )}
          </div>
        </div>
      </main>
    </>
  );
}

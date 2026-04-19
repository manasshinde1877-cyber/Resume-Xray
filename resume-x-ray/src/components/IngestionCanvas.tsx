"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IngestionCanvasProps {
  onAnalyze: (file: File) => Promise<void>;
}

export function IngestionCanvas({ onAnalyze }: IngestionCanvasProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    noDragEventsBubbling: true,
  });

  const handleAnalyze = async () => {
    if (file) {
      try {
        setIsProcessing(true);
        await onAnalyze(file);
        setFile(null); // clear after success
      } catch {
        // error is handled by parent
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <AnimatePresence mode="wait">
        {!file ? (
          <div 
            {...getRootProps()} 
            data-lenis-prevent 
            className="flex-1 flex flex-col h-full relative z-50"
          >
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all ${
                isDragActive
                  ? "border-black bg-white/30"
                  : "border-black bg-white/20 hover:bg-white/30 hover:border-black/60"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-[#0d1408]/5 flex items-center justify-center mb-4 text-[#0d1408]/30">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-center text-[#0d1408]/50 font-bold uppercase tracking-widest text-xs mb-2">
                {isDragActive ? "Release to Scan" : "Click or Drop Resume"}
              </p>
              <p className="text-center text-[#0d1408]/30 text-[10px] font-medium uppercase tracking-tighter">
                HEURISTIC EXTRACTION: JPG, PNG
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="filepreview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-white/20 border border-black rounded-2xl p-6 flex flex-col items-center justify-center relative"
          >
            <button
              onClick={removeFile}
              className="absolute top-4 right-4 p-1 rounded-md bg-[#0d1408]/5 text-[#0d1408]/30 hover:text-red-600 hover:bg-white/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-[#0d1408]/5 text-[#0d1408]/40 flex items-center justify-center mb-4">
              <FileIcon className="w-8 h-8" />
            </div>
            <p className="font-bold text-[#0d1408] mb-1 max-w-[200px] truncate uppercase tracking-tighter text-sm">
              {file.name}
            </p>
            <p className="text-[10px] font-black text-[#0d1408]/30 mb-6 uppercase">
              {(file.size / 1024 / 1024).toFixed(2)} MB • READY
            </p>
 
            <button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full py-4 px-4 bg-[#0d1408] hover:bg-[#1a260f] text-[#99AD7A] rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-black/10"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Run X-Ray Analysis
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

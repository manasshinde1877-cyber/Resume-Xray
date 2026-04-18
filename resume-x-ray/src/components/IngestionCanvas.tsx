"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IngestionCanvasProps {
  onAnalyze: (file: File) => void;
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
  });

  const handleAnalyze = () => {
    if (file) {
      setIsProcessing(true);
      onAnalyze(file);
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
          <div {...getRootProps()} className="flex-1 flex flex-col h-full">
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-colors ${
                isDragActive
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700/50 bg-slate-950/50 hover:bg-slate-800/50 hover:border-cyan-400/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 group-hover:text-cyan-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-center text-slate-300 font-medium mb-1">
                {isDragActive ? "Drop resume here..." : "Drag & Drop Resume"}
              </p>
              <p className="text-center text-slate-500 text-sm">
                Supports JPG, PNG (Max 5MB)
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="filepreview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center relative"
          >
            <button
              onClick={removeFile}
              className="absolute top-4 right-4 p-1 rounded-md bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <FileIcon className="w-8 h-8" />
            </div>
            <p className="font-medium text-slate-200 mb-1 max-w-[200px] truncate">
              {file.name}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <button
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                "Run X-Ray Analysis"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

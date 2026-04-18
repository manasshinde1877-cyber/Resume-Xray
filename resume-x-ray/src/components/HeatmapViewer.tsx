"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBlindMode } from "@/context/BlindModeContext";

interface BoundingBox {
  vertices: { x: number; y: number }[];
}

interface VisionWord {
  text: string;
  boundingBox: BoundingBox;
}

interface HeatmapViewerProps {
  imageUrl: string | null;
  visionWords: VisionWord[];
  analysis: {
    ats_keywords?: string[];
    recruiter_highlights?: string[];
    pii_entities?: string[];
  } | null;
  viewMode: "ats" | "recruiter";
  imageWidth?: number;
  imageHeight?: number;
}

export function HeatmapViewer({
  imageUrl,
  visionWords,
  analysis,
  viewMode,
  imageWidth,
  imageHeight,
}: HeatmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isBlindMode } = useBlindMode();
  const [renderBox, setRenderBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current && imageWidth && imageHeight) {
      const { clientWidth, clientHeight } = containerRef.current;
      
      const scale = Math.min(clientWidth / imageWidth, clientHeight / imageHeight);
      setRenderBox({
        width: imageWidth * scale,
        height: imageHeight * scale
      });
    }
  }, [imageUrl, imageWidth, imageHeight]);

  if (!imageUrl) {
    return (
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/50 flex items-center justify-center">
        <p className="text-slate-600">No active map</p>
      </div>
    );
  }

  // Calculate scaling factors between original image and rendered map
  const scaleX = imageWidth ? renderBox.width / imageWidth : 1;
  const scaleY = imageHeight ? renderBox.height / imageHeight : 1;

  // Filter words that should glow based on analysis
  const getGlowIntensity = (text: string) => {
    if (!analysis) return 0;
    
    // Exact or partial match check
    const checkMatch = (keywords: string[] = []) => 
      keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(text.toLowerCase()));

    if (viewMode === "ats") {
      return checkMatch(analysis.ats_keywords) ? 1 : 0.1;
    } else {
      return checkMatch(analysis.recruiter_highlights) ? 1 : 0.1;
    }
  };

  const isPII = (text: string) => {
    if (!analysis?.pii_entities) return false;
    return analysis.pii_entities.some((kw) => 
      text.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(text.toLowerCase())
    );
  };

  return (
    <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center overflow-auto p-4" ref={containerRef}>
      {renderBox.width > 0 && (
        <div 
          className="relative shadow-2xl shadow-cyan-900/20"
          style={{ width: renderBox.width, height: renderBox.height, backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' }}
        >
          {/* Overlay elements */}
          {visionWords.map((word, idx) => {
            const intensity = getGlowIntensity(word.text);
            const piiMatch = isPII(word.text);

            if (intensity === 0 && !piiMatch) return null; // optimize rendering

            const x = word.boundingBox.vertices[0]?.x || 0;
            const y = word.boundingBox.vertices[0]?.y || 0;
            const w = (word.boundingBox.vertices[2]?.x || x) - x;
            const h = (word.boundingBox.vertices[2]?.y || y) - y;

            const isBlind = isBlindMode && piiMatch;

            if (isBlind) {
              return (
                <div
                  key={`blur-${idx}`}
                  style={{
                    position: "absolute",
                    left: x * scaleX,
                    top: y * scaleY,
                    width: w * scaleX,
                    height: h * scaleY,
                    backdropFilter: "blur(12px) contrast(0.2)",
                    background: "rgba(0,0,0,0.5)",
                    zIndex: 20
                  }}
                />
              );
            }

            if (intensity > 0.5) {
              const color = viewMode === "ats" ? "rgba(6, 182, 212, 0.4)" : "rgba(234, 179, 8, 0.5)";
              const shadow = viewMode === "ats" ? "0 0 15px 2px rgba(6, 182, 212, 0.6)" : "0 0 20px 5px rgba(234, 179, 8, 0.8)";
              
              return (
                <motion.div
                  key={`box-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.005 }}
                  title={word.text}
                  style={{
                    position: "absolute",
                    left: x * scaleX,
                    top: y * scaleY,
                    width: w * scaleX,
                    height: h * scaleY,
                    background: color,
                    boxShadow: shadow,
                    borderRadius: "2px",
                    zIndex: 10
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

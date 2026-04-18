"use client";

import React, { createContext, useContext, useState } from "react";

interface BlindModeContextType {
  isBlindMode: boolean;
  toggleBlindMode: () => void;
}

const BlindModeContext = createContext<BlindModeContextType | undefined>(undefined);

export function BlindModeProvider({ children }: { children: React.ReactNode }) {
  const [isBlindMode, setIsBlindMode] = useState(false);

  const toggleBlindMode = () => setIsBlindMode((prev) => !prev);

  // We can add a class to body when blind mode is active, or wrap it.
  React.useEffect(() => {
    if (isBlindMode) {
      document.body.classList.add('blind-mode-active');
    } else {
      document.body.classList.remove('blind-mode-active');
    }
  }, [isBlindMode]);

  return (
    <BlindModeContext.Provider value={{ isBlindMode, toggleBlindMode }}>
      {children}
    </BlindModeContext.Provider>
  );
}

export function useBlindMode() {
  const context = useContext(BlindModeContext);
  if (context === undefined) {
    throw new Error("useBlindMode must be used within a BlindModeProvider");
  }
  return context;
}

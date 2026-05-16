import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type BusinessMode = "online" | "offline";

interface ModeContextType {
  mode: BusinessMode;
  setMode: (mode: BusinessMode) => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: "online",
  setMode: () => {},
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<BusinessMode>(() => {
    try {
      return (localStorage.getItem("builder-brief-mode") as BusinessMode) || "online";
    } catch {
      return "online";
    }
  });

  const setMode = (newMode: BusinessMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem("builder-brief-mode", newMode);
    } catch {
      // ignore
    }
  };

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextType {
  return useContext(ModeContext);
}

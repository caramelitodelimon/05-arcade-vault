"use client";

// ===== lib/session-context.tsx — sesión en memoria =====
// Stand-in del backend real: reemplaza av_user/av_scores de localStorage
// del prototipo por estado de React puro. No hay persistencia entre
// recargas de página (ver specs/01-mvp-pantallas.md, sección Decisiones).

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface SessionUser {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

interface SessionContextValue {
  user: SessionUser | null;
  login: (user: SessionUser | null) => void;
  logout: () => void;
  scores: SavedScore[];
  saveScore: (entry: { game: string; score: number; name: string }) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [scores, setScores] = useState<SavedScore[]>([]);

  const login = useCallback((nextUser: SessionUser | null) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const saveScore = useCallback((entry: { game: string; score: number; name: string }) => {
    setScores((all) => [...all, { ...entry, at: Date.now() }]);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, scores, saveScore }),
    [user, login, logout, scores, saveScore],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}

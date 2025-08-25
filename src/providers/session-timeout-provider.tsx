"use client";

import { createContext, useContext } from "react";

import { useSessionTimeout } from "@/hooks/use-session-timeout";

interface SessionTimeoutContextProps {
  resetTimer: () => void;
  getRemainingTime: () => number;
}

const SessionTimeoutContext = createContext<
  SessionTimeoutContextProps | undefined
>(undefined);

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export function SessionTimeoutProvider({
  children,
  timeoutMinutes = 30, // 30 minutos por padrão
  warningMinutes = 5, // Aviso 5 minutos antes
}: SessionTimeoutProviderProps) {
  const { resetTimer, getRemainingTime } = useSessionTimeout({
    timeoutMinutes,
    warningMinutes,
    onTimeout: () => {
      // Redirecionar para página de login será feito automaticamente pelo authClient.signOut()
      window.location.href = "/authentication";
    },
    onWarning: () => {
      // Log para debug
      console.log("Aviso de timeout de sessão exibido");
    },
  });

  return (
    <SessionTimeoutContext.Provider value={{ resetTimer, getRemainingTime }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeoutContext() {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error(
      "useSessionTimeoutContext deve ser usado dentro de SessionTimeoutProvider",
    );
  }
  return context;
}

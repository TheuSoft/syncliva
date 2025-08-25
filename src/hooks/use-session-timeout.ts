"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export function useSessionTimeout({
  timeoutMinutes = 30, // 30 minutos por padrão
  warningMinutes = 5, // Aviso 5 minutos antes
  onTimeout,
  onWarning,
}: UseSessionTimeoutProps = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
      toast.error("Sessão expirada. Faça login novamente.", {
        duration: 5000,
      });
      onTimeout?.();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Limpar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Configurar timer para aviso
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      toast.warning(
        `Sua sessão expirará em ${warningMinutes} minutos devido à inatividade.`,
        {
          duration: 10000,
          action: {
            label: "Continuar sessão",
            onClick: () => {
              resetTimer();
              toast.dismiss();
            },
          },
        },
      );
      onWarning?.();
    }, warningTime);

    // Configurar timer para logout
    const timeoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(logout, timeoutTime);
  }, [timeoutMinutes, warningMinutes, logout, onWarning]);

  useEffect(() => {
    // Eventos que indicam atividade do usuário
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      const now = Date.now();
      // Só resetar o timer se passou mais de 30 segundos desde a última atividade
      // para evitar resetar constantemente
      if (now - lastActivityRef.current > 30000) {
        resetTimer();
      }
    };

    // Adicionar event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Inicializar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetTimer]);

  return {
    resetTimer,
    getRemainingTime: () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = timeoutMinutes * 60 * 1000 - elapsed;
      return Math.max(0, remaining);
    },
  };
}

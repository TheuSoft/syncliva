"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { useSessionTimeoutContext } from "@/providers/session-timeout-provider";

interface SessionTimerProps {
  showTimer?: boolean;
}

export function SessionTimer({ showTimer = false }: SessionTimerProps) {
  const { getRemainingTime } = useSessionTimeoutContext();
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!showTimer) return;

    const updateTimer = () => {
      setRemainingTime(getRemainingTime());
    };

    // Atualizar a cada minuto
    const interval = setInterval(updateTimer, 60000);
    updateTimer(); // Atualizar imediatamente

    return () => clearInterval(interval);
  }, [getRemainingTime, showTimer]);

  if (!showTimer) return null;

  const minutes = Math.floor(remainingTime / (1000 * 60));
  const isWarning = minutes <= 5;

  return (
    <Badge
      variant={isWarning ? "destructive" : "secondary"}
      className="text-xs"
    >
      Sessão: {minutes}min
    </Badge>
  );
}

"use client";

import { useEffect, useState } from "react";

interface TokenData {
  inviteLink: string;
  doctorName: string;
  doctorEmail: string;
  timestamp: number; // Para expiração opcional
}

interface PersistentTokenState {
  hasGeneratedToken: boolean;
  tokenData: TokenData | null;
}

const TOKEN_EXPIRY_HOURS = 24; // Token persiste por 24 horas

export function usePersistentToken(doctorId: string) {
  const [hasGeneratedToken, setHasGeneratedToken] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const storageKey = `doctor-token-${doctorId}`;

  // Carregar estado do localStorage ao montar o componente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: PersistentTokenState = JSON.parse(stored);

        // Verificar se o token não expirou
        if (parsed.tokenData) {
          const now = Date.now();
          const tokenAge = now - parsed.tokenData.timestamp;
          const isExpired = tokenAge > TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

          if (!isExpired) {
            setHasGeneratedToken(parsed.hasGeneratedToken);
            setTokenData(parsed.tokenData);
          } else {
            // Token expirado, limpar do localStorage
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar token do localStorage:", error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Função para salvar novo token
  const saveToken = (newTokenData: Omit<TokenData, "timestamp">) => {
    const tokenWithTimestamp: TokenData = {
      ...newTokenData,
      timestamp: Date.now(),
    };

    const stateToSave: PersistentTokenState = {
      hasGeneratedToken: true,
      tokenData: tokenWithTimestamp,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      setHasGeneratedToken(true);
      setTokenData(tokenWithTimestamp);
    } catch (error) {
      console.error("Erro ao salvar token no localStorage:", error);
    }
  };

  // Função para limpar token
  const clearToken = () => {
    try {
      localStorage.removeItem(storageKey);
      setHasGeneratedToken(false);
      setTokenData(null);
    } catch (error) {
      console.error("Erro ao limpar token do localStorage:", error);
    }
  };

  return {
    hasGeneratedToken,
    tokenData,
    saveToken,
    clearToken,
  };
}

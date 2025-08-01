"use client";

import { createContext, ReactNode,useContext, useState } from "react";

interface TokenData {
  inviteLink: string;
  doctorName: string;
  doctorEmail: string;
}

interface TokenDialogContextProps {
  tokenData: TokenData | null;
  showTokenDialog: (data: TokenData) => void;
  hideTokenDialog: () => void;
}

const TokenDialogContext = createContext<TokenDialogContextProps | undefined>(undefined);

export function TokenDialogProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const showTokenDialog = (data: TokenData) => {
    console.log("🎯 Context showTokenDialog called with:", data);
    setTokenData(data);
  };

  const hideTokenDialog = () => {
    console.log("🎯 Context hideTokenDialog called");
    setTokenData(null);
  };

  return (
    <TokenDialogContext.Provider value={{
      tokenData,
      showTokenDialog,
      hideTokenDialog,
    }}>
      {children}
    </TokenDialogContext.Provider>
  );
}

export function useTokenDialog() {
  const context = useContext(TokenDialogContext);
  if (context === undefined) {
    throw new Error("useTokenDialog must be used within a TokenDialogProvider");
  }
  return context;
}

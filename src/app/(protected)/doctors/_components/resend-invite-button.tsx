"use client";

import { RotateCcw } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { resendInvite } from "@/actions/resend-invite";
import { Button } from "@/components/ui/button";
import { usePersistentToken } from "@/hooks/use-persistent-token";

import { TokenDisplayDialog } from "./token-display-dialog";

interface ResendInviteButtonProps {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  disabled?: boolean;
}

export function ResendInviteButton({
  doctorId,
  doctorEmail,
  disabled,
}: ResendInviteButtonProps) {
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Usar hook personalizado para persistir estado do token
  const { hasGeneratedToken, tokenData, saveToken } =
    usePersistentToken(doctorId);

  const { execute, isExecuting } = useAction(resendInvite, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // Mostrar o diálogo com o token
        if (data.inviteLink && data.doctorName && data.doctorEmail) {
          // Salvar token no localStorage e estado
          saveToken({
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });

          // Mostrar modal do token
          setTimeout(() => {
            setShowTokenModal(true);
          }, 100);

          toast.success("Token renovado com sucesso!");
        }
      } else if (data?.error) {
        // Erro específico retornado pela action
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao gerar token");
    },
  });

  const handleResend = () => {
    execute({
      doctorId,
      email: doctorEmail,
    });
  };

  const handleShowToken = () => {
    console.log(
      "🎯 ResendInviteButton handleShowToken called, current tokenData:",
      tokenData,
    );
    // Se não há tokenData, não podemos mostrar o modal
    if (!tokenData) {
      toast.error("Nenhum token disponível para exibir");
      return;
    }
    // Mostrar o modal de exibição do token
    setShowTokenModal(true);
  };

  return (
    <>
      {!hasGeneratedToken ? (
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExecuting}
          className="group relative h-8 cursor-pointer overflow-hidden border-orange-200 text-sm text-orange-700 transition-all duration-300 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-800 dark:text-orange-400 dark:hover:border-orange-700 dark:hover:bg-orange-950/30"
          onClick={handleResend}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            {isExecuting ? "Gerando..." : "Gerar Novo Token"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-orange-950/20 dark:to-orange-950/40" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="group relative h-8 cursor-pointer overflow-hidden border-green-200 text-sm text-green-700 transition-all duration-300 hover:border-green-300 hover:bg-green-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:text-green-400 dark:hover:border-green-700 dark:hover:bg-green-950/30"
          onClick={handleShowToken}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Ver Token
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-green-950/20 dark:to-green-950/40" />
        </Button>
      )}

      {/* Diálogo de exibição do token */}
      {tokenData && (
        <TokenDisplayDialog
          open={showTokenModal}
          onClose={() => {
            console.log(
              "🎯 ResendInviteButton TokenDisplayDialog onClose called",
            );
            setShowTokenModal(false);
          }}
          inviteLink={tokenData.inviteLink}
          doctorName={tokenData.doctorName}
          doctorEmail={tokenData.doctorEmail}
        />
      )}
    </>
  );
}

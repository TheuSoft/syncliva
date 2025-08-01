"use client";

import { RotateCcw } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { resendInvite } from "@/actions/resend-invite";
import { Button } from "@/components/ui/button";

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
  disabled 
}: ResendInviteButtonProps) {
  const [tokenData, setTokenData] = useState<{
    inviteLink: string;
    doctorName: string;
    doctorEmail: string;
  } | null>(null);

  const { execute, isExecuting } = useAction(resendInvite, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // Mostrar o diálogo com o token
        if (data.inviteLink && data.doctorName && data.doctorEmail) {
          setTokenData({
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });
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
      email: doctorEmail 
    });
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        disabled={disabled || isExecuting}
        className="h-8 px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        onClick={handleResend}
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        {isExecuting ? "Gerando..." : "Token Gerado"}
      </Button>
      
      {/* Diálogo de exibição do token */}
      {tokenData && (
        <TokenDisplayDialog
          open={!!tokenData}
          onClose={() => setTokenData(null)}
          inviteLink={tokenData.inviteLink}
          doctorName={tokenData.doctorName}
          doctorEmail={tokenData.doctorEmail}
        />
      )}
    </>
  );
}

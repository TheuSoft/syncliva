"use client";

import { Mail } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { inviteDoctor } from "@/actions/medicos/invite-doctor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePersistentToken } from "@/hooks/use-persistent-token";

import { TokenDisplayDialog } from "./token-display-dialog";

interface InviteDoctorButtonProps {
  doctorId: string;
  doctorName: string;
  disabled?: boolean;
}

export function InviteDoctorButton({
  doctorId,
  doctorName,
  disabled,
}: InviteDoctorButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Usar hook personalizado para persistir estado do token
  const { hasGeneratedToken, tokenData, saveToken } =
    usePersistentToken(doctorId);

  const { execute, isExecuting } = useAction(inviteDoctor, {
    onSuccess: ({ data }) => {
      console.log("🎯 InviteDoctorButton onSuccess data:", data);

      if (data?.success && "inviteLink" in data) {
        console.log("🎯 Success condition met, closing form dialog");
        setOpen(false);
        setEmail("");

        // Mostrar o diálogo com o token
        if (data.inviteLink && data.doctorName && data.doctorEmail) {
          console.log("🎯 All data present, saving token data");
          console.log("🎯 Data to save:", {
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });

          // Salvar token no localStorage e estado
          saveToken({
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });

          // Usar setTimeout para garantir que o diálogo principal se feche primeiro
          setTimeout(() => {
            console.log("🎯 Opening token display modal");
            setShowTokenModal(true);
          }, 100);

          toast.success(data.message || "Token gerado com sucesso!");
        } else {
          console.log("🚨 Missing data for token dialog:", {
            inviteLink: !!data.inviteLink,
            doctorName: !!data.doctorName,
            doctorEmail: !!data.doctorEmail,
          });
        }
      } else if (data && "error" in data) {
        console.log("🚨 Error in action:", data.error);
        toast.error(data.error);
      } else {
        console.log("🚨 Unexpected data structure:", data);
      }
    },
    onError: ({ error }) => {
      console.log("🚨 InviteDoctorButton onError:", error);
      toast.error(error.serverError || "Erro ao enviar convite");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🎯 handleSubmit called with email:", email);

    if (!email) {
      toast.error("Email é obrigatório");
      return;
    }

    console.log("🎯 Executing invite action for:", { doctorId, email });
    execute({ doctorId, email });
  };

  // Função para mostrar o último token gerado
  const handleShowToken = () => {
    console.log("🎯 handleShowToken called, current tokenData:", tokenData);
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
      {/* Só mostrar o Dialog de geração se não temos token gerado */}
      {!hasGeneratedToken ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="group relative h-8 w-full cursor-pointer overflow-hidden border-blue-200 text-sm text-blue-700 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Gerar Token
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/20 dark:to-blue-950/40" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Token de Acesso</DialogTitle>
              <DialogDescription>
                Gere um token para Dr. {doctorName} acessar o sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do médico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="medico@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isExecuting}>
                  {isExecuting ? "Gerando..." : "Gerar Convite"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        /* Se já temos token gerado, mostrar o botão "Ver Token" */
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="group relative h-8 w-full cursor-pointer overflow-hidden border-green-200 text-sm text-green-700 transition-all duration-300 hover:border-green-300 hover:bg-green-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:text-green-400 dark:hover:border-green-700 dark:hover:bg-green-950/30"
          onClick={handleShowToken}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
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
            console.log("🎯 TokenDisplayDialog onClose called");
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

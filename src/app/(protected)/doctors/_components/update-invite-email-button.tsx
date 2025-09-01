"use client";

import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { updateInviteEmail } from "@/actions/medicos/update-invite-email";
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

interface UpdateInviteEmailButtonProps {
  doctorId: string;
  doctorName: string;
  currentEmail: string;
  disabled?: boolean;
}

export function UpdateInviteEmailButton({
  doctorId,
  doctorName,
  currentEmail,
  disabled,
}: UpdateInviteEmailButtonProps) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Usar hook personalizado para persistir estado do token
  const { tokenData, saveToken } = usePersistentToken(doctorId);

  const { execute, isExecuting } = useAction(updateInviteEmail, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setOpen(false);
        setNewEmail("");

        // Mostrar o diálogo com o novo token
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

          toast.success("Email do convite atualizado com sucesso!");
        }
      } else if (data?.error) {
        // Erro específico retornado pela action
        toast.error(data.error);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao alterar email do convite");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast.error("Email é obrigatório");
      return;
    }

    if (newEmail === currentEmail) {
      toast.error("O novo email deve ser diferente do atual");
      return;
    }

    execute({ doctorId, newEmail });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Limpar o campo quando abrir
      setNewEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="group relative h-8 w-full cursor-pointer overflow-hidden border-purple-200 text-sm text-purple-700 transition-all duration-300 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800 dark:text-purple-400 dark:hover:border-purple-700 dark:hover:bg-purple-950/30"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Alterar Email
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-950/20 dark:to-purple-950/40" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Email do Convite</DialogTitle>
          <DialogDescription>
            Altere o email de convite para Dr. {doctorName}. Um novo convite
            será enviado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail">Email atual</Label>
            <Input
              id="currentEmail"
              type="email"
              value={currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newEmail">Novo email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="novo@exemplo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <ul className="list-inside list-disc space-y-1">
                    <li>O token de convite anterior será invalidado</li>
                    <li>Um novo convite será enviado para o novo email</li>
                    <li>O médico deverá usar o novo link recebido</li>
                  </ul>
                </div>
              </div>
            </div>
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
              {isExecuting ? "Alterando..." : "Alterar e Gerar Novo"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Diálogo de exibição do novo token */}
      {tokenData && (
        <TokenDisplayDialog
          open={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          inviteLink={tokenData.inviteLink}
          doctorName={tokenData.doctorName}
          doctorEmail={tokenData.doctorEmail}
        />
      )}
    </Dialog>
  );
}

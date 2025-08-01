"use client";

import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { updateInviteEmail } from "@/actions/update-invite-email";
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
  disabled 
}: UpdateInviteEmailButtonProps) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [tokenData, setTokenData] = useState<{
    inviteLink: string;
    doctorName: string;
    doctorEmail: string;
  } | null>(null);

  const { execute, isExecuting } = useAction(updateInviteEmail, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setOpen(false);
        setNewEmail("");
        
        // Mostrar o diálogo com o novo token
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
          className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4 mr-1" />
          Alterar Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Email do Convite</DialogTitle>
          <DialogDescription>
            Altere o email de convite para Dr. {doctorName}. Um novo convite será enviado automaticamente.
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
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Atenção
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
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
          open={!!tokenData}
          onClose={() => setTokenData(null)}
          inviteLink={tokenData.inviteLink}
          doctorName={tokenData.doctorName}
          doctorEmail={tokenData.doctorEmail}
        />
      )}
    </Dialog>
  );
}

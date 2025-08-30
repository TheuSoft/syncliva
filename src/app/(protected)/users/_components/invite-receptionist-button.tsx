"use client";

import { Mail } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { inviteReceptionist } from "@/actions/invite-receptionist";
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

interface InviteReceptionistButtonProps {
  receptionistId: string;
  receptionistName: string;
  currentEmail?: string;
}

export default function InviteReceptionistButton({
  receptionistId,
  receptionistName,
  currentEmail,
}: InviteReceptionistButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(currentEmail || "");

  const inviteAction = useAction(inviteReceptionist, {
    onSuccess: ({ data }) => {
      if (data?.success && 'inviteLink' in data) {
        toast.success("Convite enviado com sucesso!", {
          description: `Link de convite: ${data.inviteLink}`,
        });
        setOpen(false);
      } else if ('error' in data) {
        toast.error(data.error || "Erro ao enviar convite");
      }
    },
    onError: ({ error }) => {
      toast.error("Erro ao enviar convite", {
        description: error.serverError || "Tente novamente",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email é obrigatório");
      return;
    }
    inviteAction.execute({ receptionistId, email });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Convidar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Recepcionista</DialogTitle>
          <DialogDescription>
            Envie um convite para {receptionistName} se registrar no sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={inviteAction.isExecuting}
            >
              {inviteAction.isExecuting ? "Enviando..." : "Enviar Convite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

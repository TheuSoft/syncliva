"use client";

import { Mail } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { inviteDoctor } from "@/actions/invite-doctor";
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

interface InviteDoctorButtonProps {
  doctorId: string;
  doctorName: string;
  disabled?: boolean;
}

export function InviteDoctorButton({ 
  doctorId, 
  doctorName, 
  disabled 
}: InviteDoctorButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tokenData, setTokenData] = useState<{
    inviteLink: string;
    doctorName: string;
    doctorEmail: string;
  } | null>(null);

  const { execute, isExecuting } = useAction(inviteDoctor, {
    onSuccess: ({ data }) => {
      console.log("🎯 InviteDoctorButton onSuccess data:", data);
      
      if (data?.success && "inviteLink" in data) {
        console.log("🎯 Success condition met, closing form dialog");
        setOpen(false);
        setEmail("");
        
        // Mostrar o diálogo com o token
        if (data.inviteLink && data.doctorName && data.doctorEmail) {
          console.log("🎯 All data present, setting token data");
          console.log("🎯 Data to show:", {
            inviteLink: data.inviteLink,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
          });
          
          // Usar setTimeout para garantir que o diálogo principal se feche primeiro
          setTimeout(() => {
            console.log("🎯 Setting tokenData state");
            setTokenData({
              inviteLink: data.inviteLink,
              doctorName: data.doctorName,
              doctorEmail: data.doctorEmail,
            });
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={disabled}
            className="h-8 px-2"
          >
            <Mail className="h-4 w-4 mr-1" />
            Gerar Token
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

      {/* Diálogo de exibição do token */}
      {tokenData && (
        <TokenDisplayDialog
          open={!!tokenData}
          onClose={() => {
            console.log("🎯 TokenDisplayDialog onClose called");
            setTokenData(null);
          }}
          inviteLink={tokenData.inviteLink}
          doctorName={tokenData.doctorName}
          doctorEmail={tokenData.doctorEmail}
        />
      )}
    </>
  );
}

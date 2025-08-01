"use client";

import { Check,Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TokenDisplayDialogProps {
  open: boolean;
  onClose: () => void;
  inviteLink: string;
  doctorName: string;
  doctorEmail: string;
}

export function TokenDisplayDialog({
  open,
  onClose,
  inviteLink,
  doctorName,
  doctorEmail,
}: TokenDisplayDialogProps) {
  const [copied, setCopied] = useState(false);

  console.log("🎯 TokenDisplayDialog render - props:", {
    open,
    inviteLink,
    doctorName,
    doctorEmail,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar o link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Convite Gerado com Sucesso!</DialogTitle>
          <DialogDescription>
            O link de convite foi gerado para Dr. {doctorName}. 
            Compartilhe este link diretamente com o médico.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctorEmail">Email do médico</Label>
            <Input
              id="doctorEmail"
              type="email"
              value={doctorEmail}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inviteLink">Link de convite</Label>
            <div className="flex gap-2">
              <Input
                id="inviteLink"
                value={inviteLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Instruções
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Copie o link acima e envie diretamente para o médico</li>
                    <li>O médico deve clicar no link para criar sua conta</li>
                    <li>O link expira em 7 dias</li>
                    <li>Após o registro, o médico terá acesso ao sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Importante
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  Este link contém informações sensíveis. Compartilhe apenas com o médico designado.
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose} className="w-full">
              Fechar e Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

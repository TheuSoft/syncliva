"use client";

import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  Shield,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { resetDoctorPassword } from "@/actions/reset-doctor-password";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Doctor {
  id: string;
  name: string;
  email?: string | null;
  specialty: string;
  registeredAt?: Date | null;
}

interface ResetDoctorPasswordDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetDoctorPasswordDialog({
  doctor,
  open,
  onOpenChange,
}: ResetDoctorPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"confirm" | "result">("confirm");

  const handleReset = async () => {
    if (!doctor) return;

    setIsLoading(true);

    try {
      const result = await resetDoctorPassword({ doctorId: doctor.id });

      if (result?.data?.success) {
        setTemporaryPassword(result.data.temporaryPassword);
        setStep("result");

        toast.success("Senha temporária gerada!", {
          description: `Nova senha criada para Dr(a). ${doctor.name}`,
        });
      } else {
        toast.error("Erro ao gerar senha temporária");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro inesperado", {
        description: errorMessage,
      });
      console.error("Erro ao redefinir senha:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      toast.success("Senha copiada!", {
        description: "Senha temporária copiada para a área de transferência",
      });
    } catch {
      toast.error("Erro ao copiar senha");
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setTemporaryPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  if (!doctor) return null;

  const isRegistered = !!doctor.registeredAt;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        {step === "confirm" && (
          <>
            <AlertDialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Key className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg font-semibold text-orange-600">
                    Redefinir Senha
                  </AlertDialogTitle>
                  <p className="text-muted-foreground text-sm">
                    Gerar nova senha temporária
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {/* Aviso */}
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-orange-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-orange-800">
                        Nova senha temporária
                      </p>
                      <p className="text-xs text-orange-700">
                        Uma senha temporária será gerada. Comunique ao médico
                        por telefone ou WhatsApp e oriente-o a alterar a senha
                        no primeiro acesso.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Médico */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Médico selecionado:</h4>

                  <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">Nome:</span>
                      <span>{doctor.name}</span>
                    </div>

                    {doctor.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span className="font-medium">Email:</span>
                        <span className="text-xs">{doctor.email}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge
                        variant={isRegistered ? "default" : "secondary"}
                        className={
                          isRegistered
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {isRegistered ? "Cadastrado" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {!isRegistered && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-red-800">
                          Médico ainda não registrado
                        </p>
                        <p className="text-xs text-red-700">
                          Este médico ainda não finalizou o cadastro no sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReset}
                disabled={isLoading || !isRegistered}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Gerando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Gerar Senha Temporária
                  </div>
                )}
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === "result" && (
          <>
            <AlertDialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg font-semibold text-green-600">
                    Senha Gerada com Sucesso!
                  </AlertDialogTitle>
                  <p className="text-muted-foreground text-sm">
                    Comunique ao médico imediatamente
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {/* Senha Temporária */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Senha Temporária:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Mostrar
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-muted space-y-2 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={temporaryPassword}
                        readOnly
                        className="text-center font-mono text-lg tracking-wider"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Instruções */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">
                        Próximos passos:
                      </p>
                      <ul className="space-y-1 text-xs text-blue-700">
                        <li>
                          • Ligue ou envie WhatsApp para Dr(a). {doctor.name}
                        </li>
                        <li>• Informe a senha temporária</li>
                        <li>• Oriente o login em: /authentication</li>
                        <li>• Médico será obrigado a criar nova senha</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter>
              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

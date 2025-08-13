"use client";

import {
  AlertTriangle,
  Calendar,
  Mail,
  Stethoscope,
  Trash2,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDoctor } from "@/actions/delete-doctor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface Doctor {
  id: string;
  name: string;
  email?: string | null;
  specialty: string;
  appointmentPriceInCents: number;
  registeredAt?: Date | null;
}

interface DeleteDoctorConfirmationDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDoctorConfirmationDialog({
  doctor,
  open,
  onOpenChange,
}: DeleteDoctorConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const handleDelete = async () => {
    if (!doctor || !confirmChecked) return;

    setIsLoading(true);

    try {
      const result = await deleteDoctor({ id: doctor.id });

      if (result?.data?.success) {
        const appointmentsMsg =
          result.data.deletedAppointments > 0
            ? ` ${result.data.deletedAppointments} agendamento(s) foram removidos.`
            : "";
        const userMsg =
          result.data.deletedUsers > 0
            ? " Acesso ao sistema foi revogado."
            : "";

        toast.success("Médico excluído permanentemente!", {
          description: `Dr(a). ${doctor.name} foi removido do sistema.${appointmentsMsg}${userMsg}`,
          action: {
            label: "Fechar",
            onClick: () => {},
          },
        });
        onOpenChange(false);
      } else {
        toast.error("Erro ao excluir médico", {
          description: "Não foi possível excluir o médico.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro inesperado", {
        description: `Ocorreu um erro ao tentar excluir o médico: ${errorMessage}`,
      });
      console.error("Erro ao excluir médico:", error);
    } finally {
      setIsLoading(false);
      setConfirmChecked(false);
    }
  };

  const handleCancel = () => {
    setConfirmChecked(false);
    onOpenChange(false);
  };

  if (!doctor) return null;

  const isRegistered = !!doctor.registeredAt;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-red-600">
                Excluir Médico
              </AlertDialogTitle>
              <p className="text-muted-foreground text-sm">
                Esta ação não pode ser desfeita
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4">
            {/* Aviso de Perigo */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 h-4 w-4 text-red-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-800">
                    Ação Irreversível
                  </p>
                  <p className="text-xs text-red-700">
                    O médico será removido permanentemente do sistema.
                    {isRegistered &&
                      " Todos os agendamentos e acesso ao dashboard serão removidos."}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalhes do Médico */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Detalhes do Médico:</h4>

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
                    <span>{doctor.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Especialidade:</span>
                  <span>{doctor.specialty}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Valor da consulta:</span>
                  <span>
                    R$ {(doctor.appointmentPriceInCents / 100).toFixed(2)}
                  </span>
                </div>

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

            {/* Avisos adicionais para médicos cadastrados */}
            {isRegistered && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="flex items-start gap-2">
                  <UserX className="mt-0.5 h-4 w-4 text-orange-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-800">
                      Consequências da exclusão:
                    </p>
                    <ul className="space-y-1 text-xs text-orange-700">
                      <li>• Todos os agendamentos serão cancelados</li>
                      <li>• Acesso ao dashboard será revogado</li>
                      <li>• Dados do médico serão removidos permanentemente</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Checkbox de Confirmação */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confirm-delete"
                checked={confirmChecked}
                onCheckedChange={(checked) =>
                  setConfirmChecked(checked === true)
                }
                className="mt-1"
              />
              <div className="space-y-1">
                <label
                  htmlFor="confirm-delete"
                  className="cursor-pointer text-sm leading-none font-medium"
                >
                  Confirmar exclusão
                </label>
                <p className="text-muted-foreground text-xs">
                  Entendo que esta ação é permanente e não pode ser desfeita
                </p>
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!confirmChecked || isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir Permanentemente
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

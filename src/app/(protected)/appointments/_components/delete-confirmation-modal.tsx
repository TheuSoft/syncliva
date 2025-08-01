"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
  User,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/delete-appointment";
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
import type { AppointmentWithRelations } from "@/types/appointments";

interface DeleteConfirmationDialogProps {
  appointment: AppointmentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmationDialog({
  appointment,
  open,
  onOpenChange,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const handleDelete = async () => {
    if (!appointment || !confirmChecked) return;

    setIsLoading(true);

    try {
      const result = await deleteAppointment({ appointmentId: appointment.id });

      if (result.success) {
        toast.success("Agendamento excluído permanentemente!", {
          description: `O agendamento de ${appointment.patient.name} foi removido do sistema.`,
          action: {
            label: "Fechar",
            onClick: () => {},
          },
        });
        onOpenChange(false);
      } else {
        toast.error("Erro ao excluir agendamento", {
          description: result.message,
        });
      }
    } catch (error) {
      // ✅ CORRIGIDO: Usar a variável error
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro inesperado", {
        description: `Ocorreu um erro ao tentar excluir o agendamento: ${errorMessage}`,
      });
      console.error("Erro ao excluir agendamento:", error);
    } finally {
      setIsLoading(false);
      setConfirmChecked(false);
    }
  };

  const handleCancel = () => {
    setConfirmChecked(false);
    onOpenChange(false);
  };

  if (!appointment) return null;

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
                Excluir Agendamento
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
                    O agendamento será removido permanentemente do sistema e
                    todos os dados relacionados serão perdidos.
                  </p>
                </div>
              </div>
            </div>

            {/* Detalhes do Agendamento */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Detalhes do Agendamento:</h4>

              <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Paciente:</span>
                  <span>{appointment.patient.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <UserX className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Médico:</span>
                  <span>{appointment.doctor.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Data:</span>
                  <span>
                    {format(appointment.date, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Horário:</span>
                  <span>
                    {format(appointment.date, "HH:mm", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    Cancelado
                  </Badge>
                </div>
              </div>
            </div>

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

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Calendar, Clock, Stethoscope, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/agendamentos/delete-appointment";
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
import { Separator } from "@/components/ui/separator";
import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface DeleteConfirmationModalProps {
  appointment: AppointmentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function DeleteConfirmationModal({
  appointment,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!appointment) return;
    setIsLoading(true);

    try {
      const result = await deleteAppointment({ appointmentId: appointment.id });
      if (result.success) {
        toast.success("Agendamento excluído permanentemente!");
        onSuccess?.();
        onOpenChange(false);
      } else {
        onError?.(result.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      onError?.(`Erro ao excluir: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-red-600">
                Excluir Agendamento
              </AlertDialogTitle>
              <p className="text-muted-foreground text-sm">
                Esta ação é irreversível e removerá o agendamento
                permanentemente.
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O
                agendamento será removido permanentemente do sistema.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Detalhes do agendamento:</h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">
                    {format(
                      dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
                      "dd/MM/yyyy",
                      { locale: ptBR },
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">
                    {format(
                      dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
                      "HH:mm",
                      { locale: ptBR },
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{appointment.patient.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Stethoscope className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">Dr. {appointment.doctor.name}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valor:</span>
                  <Badge variant="secondary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(appointment.appointmentPriceInCents / 100)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    variant={
                      appointment.status === "confirmed"
                        ? "default"
                        : appointment.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {appointment.status === "confirmed"
                      ? "Confirmado"
                      : appointment.status === "pending"
                        ? "Pendente"
                        : "Cancelado"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? "Excluindo..." : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

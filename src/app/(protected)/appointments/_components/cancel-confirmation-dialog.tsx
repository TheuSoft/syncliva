"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Stethoscope,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/agendamentos/cancel-appointment";
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

interface CancelConfirmationDialogProps {
  appointment: AppointmentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function CancelConfirmationDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: CancelConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmCancel = async () => {
    if (!appointment) return;
    setIsLoading(true);

    try {
      const result = await cancelAppointment({ appointmentId: appointment.id });
      if (result.success) {
        toast.success("Agendamento cancelado com sucesso!");
        onSuccess?.();
        // **Não fechar automaticamente**: apenas altera o conteúdo
      } else {
        onError?.(result.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      onError?.(`Erro ao cancelar: ${msg}`);
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-orange-600">
                Cancelar Agendamento
              </AlertDialogTitle>
              <p className="text-muted-foreground text-sm">
                Ao confirmar, o status será alterado para &quot;cancelado&quot;.
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="space-y-4">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-800">
                O agendamento permanecerá no sistema para histórico e poderá ser
                excluído permanentemente depois.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Detalhes:</h4>

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
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCancel}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

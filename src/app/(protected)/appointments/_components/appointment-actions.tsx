"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { confirmAppointment } from "@/actions/confirm-appointment";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppointmentWithRelations } from "@/types/appointments";

import { CancelConfirmationDialog } from "./cancel-confirmation-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-modal";
import { ErrorDialog } from "./error-dialog";

interface AppointmentActionsProps {
  appointment: AppointmentWithRelations;
  onEdit: (appointment: AppointmentWithRelations) => void;
}

export function AppointmentActions({
  appointment,
  onEdit,
}: AppointmentActionsProps) {
  const [isPending, startTransition] = useTransition();

  // Estados para diferentes dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // Estado para mensagem de erro
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Função para confirmar agendamento
  const handleConfirm = (): void => {
    startTransition(async () => {
      const result = await confirmAppointment({
        appointmentId: appointment.id,
      });

      if (result.success) {
        toast.success("Agendamento marcado como pago!");
        console.log(`✅ Agendamento ${appointment.id} confirmado com sucesso.`);
      } else {
        setErrorMessage(result.message);
        setErrorDialogOpen(true);
      }
    });
  };

  // ✅ Abertura do cancelamento
  const handleCancel = (): void => {
    setCancelDialogOpen(true);
  };

  // ✅ Callback de sucesso do cancelamento
  const handleCancelSuccess = () => {
    console.log(`✅ Agendamento ${appointment.id} cancelado com sucesso.`);
    // Pode adicionar um feedback visual (toast, alert, etc)
  };

  const handleCancelError = (message: string) => {
    setErrorMessage(message);
    setErrorDialogOpen(true);
  };

  const handleEdit = (): void => {
    onEdit(appointment);
  };

  const handleDelete = (): void => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {appointment.status !== "canceled" &&
            appointment.status !== "confirmed" && (
              <DropdownMenuItem onClick={handleEdit} disabled={isPending}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar agendamento
              </DropdownMenuItem>
            )}

          {appointment.status === "pending" && (
            <>
              <DropdownMenuItem
                onClick={handleConfirm}
                disabled={isPending}
                className="text-green-600"
              >
                ✓ Marcar como pago
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCancel}
                disabled={isPending}
                className="text-orange-600"
              >
                ✗ Cancelar agendamento
              </DropdownMenuItem>
            </>
          )}

          {appointment.status === "confirmed" && (
            <DropdownMenuItem
              onClick={handleCancel}
              disabled={isPending}
              className="text-orange-600"
            >
              ✗ Cancelar agendamento
            </DropdownMenuItem>
          )}

          {appointment.status === "canceled" && (
            <>
              <DropdownMenuItem disabled className="text-gray-400">
                Agendamento cancelado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir permanentemente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelConfirmationDialog
        appointment={appointment}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={handleCancelSuccess}
        onError={handleCancelError}
      />

      <DeleteConfirmationDialog
        appointment={appointment}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        message={errorMessage}
      />
    </>
  );
}

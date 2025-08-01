"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
// ✅ REMOVIDO: sucesso visual com AlertDialog
// import { SuccessDialog } from "./success-dialog";

interface ActionsCellProps {
  appointment: AppointmentWithRelations;
  onEdit: (appointment: AppointmentWithRelations) => void;
}

const ActionsCell = ({ appointment, onEdit }: ActionsCellProps) => {
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
        toast.success("Agendamento confirmado com sucesso!");
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

          {appointment.status !== "canceled" && appointment.status !== "confirmed" && (
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
                ✓ Confirmar agendamento
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
};

// Colunas da tabela
export const createAppointmentsTableColumns = (
  onEdit: (appointment: AppointmentWithRelations) => void,
): ColumnDef<AppointmentWithRelations, unknown>[] => [
  {
    id: "date",
    header: "Data",
    accessorFn: (row) => row.date,
    cell: ({ row }) => {
      return format(row.original.date, "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    },
    enableSorting: true,
    sortingFn: "datetime",
  },
  {
    id: "patient-name",
    header: "Paciente",
    accessorFn: (row) => row.patient.name,
    cell: ({ row }) => row.original.patient.name,
    enableSorting: true,
  },
  {
    id: "doctor-name",
    header: "Médico",
    accessorFn: (row) => row.doctor.name,
    cell: ({ row }) => row.original.doctor.name,
    enableSorting: true,
  },
  {
    id: "doctor-specialty",
    header: "Especialidade",
    accessorFn: (row) => row.doctor.specialty,
    cell: ({ row }) => row.original.doctor.specialty,
    enableSorting: true,
  },
  {
    id: "price",
    header: "Valor",
    accessorFn: (row) => row.appointmentPriceInCents,
    cell: ({ row }) => {
      const value = row.original.appointmentPriceInCents / 100;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
    cell: ({ row }) => {
      const status = row.original.status || "pending";

      const statusMap: Record<string, { label: string; className: string }> = {
        pending: {
          label: "Pendente",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
        confirmed: {
          label: "Confirmado",
          className: "bg-green-100 text-green-800 border-green-200",
        },
        canceled: {
          label: "Cancelado",
          className: "bg-red-100 text-red-800 border-red-200",
        },
      };

      const statusInfo = statusMap[status] || statusMap.pending;

      return (
        <span
          className={`rounded-full border px-2 py-1 text-xs font-medium ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionsCell appointment={row.original} onEdit={onEdit} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export const appointmentsTableColumns = createAppointmentsTableColumns(
  () => {},
);

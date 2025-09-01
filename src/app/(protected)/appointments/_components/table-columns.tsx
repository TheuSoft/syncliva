"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { confirmAppointment } from "@/actions/agendamentos/confirm-appointment";
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
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { ErrorDialog } from "./error-dialog";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

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
        toast.success("Agendamento pago com sucesso!");
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
                Editar
              </DropdownMenuItem>
            )}

          {appointment.status === "pending" && (
            <DropdownMenuItem onClick={handleConfirm} disabled={isPending}>
              <Pencil className="mr-2 h-4 w-4" />
              Confirmar Pagamento
            </DropdownMenuItem>
          )}

          {appointment.status !== "canceled" && (
            <DropdownMenuItem onClick={handleCancel} disabled={isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancelar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDelete} disabled={isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Permanentemente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <CancelConfirmationDialog
        appointment={appointment}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={handleCancelSuccess}
        onError={handleCancelError}
      />

      <DeleteConfirmationModal
        appointment={appointment}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => {
          console.log(`✅ Agendamento ${appointment.id} excluído com sucesso.`);
        }}
        onError={(message) => {
          setErrorMessage(message);
          setErrorDialogOpen(true);
        }}
      />

      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        message={errorMessage}
      />
    </>
  );
};

export const columns: ColumnDef<AppointmentWithRelations>[] = [
  {
    accessorKey: "date",
    header: "Data e Hora",
    cell: ({ row }) => {
      return format(
        dayjs(row.original.date).tz(BRAZIL_TIMEZONE).toDate(),
        "dd/MM/yyyy 'às' HH:mm",
        {
          locale: ptBR,
        },
      );
    },
  },
  {
    accessorKey: "patient.name",
    header: "Paciente",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.patient.name}</div>
        <div className="text-muted-foreground text-sm">
          {row.original.patient.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "doctor.name",
    header: "Médico",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">Dr. {row.original.doctor.name}</div>
        <div className="text-muted-foreground text-sm">
          {row.original.doctor.specialty}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: ({ row }) => {
      const value = row.original.appointmentPriceInCents / 100;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusMap: Record<string, { label: string; className: string }> = {
        pending: {
          label: "Pendente",
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
        },
        confirmed: {
          label: "Confirmado",
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        },
        canceled: {
          label: "Cancelado",
          className:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
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
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell appointment={row.original} onEdit={() => {}} />
    ),
  },
];

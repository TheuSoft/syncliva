"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DataTable } from "@/components/ui/data-table";
import type { AppointmentWithRelations } from "@/types/appointments";

interface TodayAppointmentsTableProps {
  appointments: AppointmentWithRelations[];
}

export default function TodayAppointmentsTable({
  appointments,
}: TodayAppointmentsTableProps) {
  // ✅ Colunas definidas no client-side
  const columns: ColumnDef<AppointmentWithRelations, unknown>[] = [
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
    },
    {
      id: "patient-name",
      header: "Paciente",
      accessorFn: (row) => row.patient.name,
      cell: ({ row }) => (
        <span className="font-medium text-blue-700 dark:text-blue-300">
          {row.original.patient.name}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: "doctor-name",
      header: "Médico",
      accessorFn: (row) => row.doctor.name,
      cell: ({ row }) => (
        <span className="font-medium text-blue-700 dark:text-blue-300">
          {row.original.doctor.name}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: "doctor-specialty",
      header: "Especialidade",
      accessorFn: (row) => row.doctor.specialty,
      cell: ({ row }) => (
        <span className="text-sm text-blue-600 dark:text-blue-400">
          {row.original.doctor.specialty}
        </span>
      ),
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
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const status = row.original.status || "pending";

        const statusMap: Record<string, { label: string; className: string }> =
          {
            pending: {
              label: "Pendente",
              className:
                "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
            },
            confirmed: {
              label: "Agendamento pago",
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
      enableSorting: true,
    },
  ];

  return (
    <div className="border-border/30 overflow-hidden rounded-lg border">
      <DataTable
        columns={columns}
        data={appointments.map((appointment) => ({
          ...appointment,
          updatedAt: appointment.updatedAt ?? new Date(),
        }))}
      />
    </div>
  );
}

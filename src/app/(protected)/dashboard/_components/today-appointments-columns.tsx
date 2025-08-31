"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

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
];

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Check, Edit, MoreVertical, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrencyInCents } from "@/helpers/currency";
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onEdit?: (appointment: AppointmentWithRelations) => void;
  onConfirm?: (appointment: AppointmentWithRelations) => void;
  onCancel?: (appointment: AppointmentWithRelations) => void;
  className?: string;
  isDoctor?: boolean; // Indica se estamos na visualização do médico
}

export function AppointmentCard({
  appointment,
  onEdit,
  onConfirm,
  onCancel,
  className,
  isDoctor = false,
}: AppointmentCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/50";
      case "canceled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900/50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "canceled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const canConfirm = appointment.status === "pending";
  const canCancel = ["pending", "confirmed"].includes(appointment.status);
  const canEdit = appointment.status !== "canceled";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "group relative flex h-full min-h-[100px] cursor-pointer flex-col rounded-lg border-2 p-2 text-xs transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:min-h-[110px] sm:p-2.5",
            getStatusColor(appointment.status),
            "w-full max-w-full overflow-hidden",
            "from-background to-muted/20 bg-gradient-to-br",
            className,
          )}
        >
          {/* Header com horário e status */}
          <div className="mb-1.5 flex items-start justify-between">
            <div className="bg-primary/10 border-primary/20 text-primary rounded-full border px-1.5 py-0.5 text-xs font-bold shadow-sm sm:px-2 sm:py-1 sm:text-sm">
              {dayjs(appointment.date).tz(BRAZIL_TIMEZONE).format("HH:mm")}
            </div>
            <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreVertical className="text-muted-foreground h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex min-w-0 flex-1 flex-col space-y-1">
            <div className="space-y-0.5">
              <div className="text-foreground truncate text-xs leading-tight font-semibold sm:text-sm">
                {appointment.patient.name}
              </div>
              <div className="text-muted-foreground truncate text-xs leading-tight">
                Dr. {appointment.doctor.name}
              </div>
            </div>

            {/* Footer com preço e status */}
            <div className="mt-auto flex min-w-0 items-center justify-between gap-1.5 pt-1.5">
              <span className="text-primary truncate text-xs leading-tight font-bold sm:text-sm">
                {formatCurrencyInCents(appointment.appointmentPriceInCents)}
              </span>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs leading-none font-bold uppercase shadow-sm sm:px-2 sm:py-1",
                  appointment.status === "confirmed" &&
                    "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                  appointment.status === "pending" &&
                    "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                  appointment.status === "canceled" &&
                    "border border-red-200 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300",
                )}
              >
                {getStatusLabel(appointment.status).substring(0, 4)}
              </span>
            </div>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="z-50 w-72 max-w-[95vw] border-0 p-0 shadow-2xl sm:w-80 lg:w-[380px] xl:w-[420px]"
        align="center"
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={16}
      >
        <div className="bg-background dark:bg-background border-border dark:border-border overflow-hidden rounded-xl border shadow-2xl">
          {/* Header com data e valor */}
          <div className="from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 border-border/50 dark:border-border/50 border-b bg-gradient-to-r p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="text-foreground dark:text-foreground text-sm font-bold sm:text-base">
                  {format(
                    dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    },
                  )}
                </h4>
                <div
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                    appointment.status === "confirmed"
                      ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : appointment.status === "pending"
                        ? "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "border border-red-200 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300"
                  }`}
                >
                  {getStatusLabel(appointment.status)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary dark:text-primary text-xl font-bold sm:text-2xl">
                  {formatCurrencyInCents(appointment.appointmentPriceInCents)}
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="space-y-3 p-4 sm:p-5">
            <div className="space-y-2.5">
              <div className="bg-muted/30 rounded-lg p-3 sm:p-3.5">
                <p className="text-foreground dark:text-foreground mb-2 flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"></div>
                  Paciente
                </p>
                <p className="text-foreground dark:text-foreground text-xs font-medium sm:text-sm">
                  {appointment.patient.name}
                </p>
                <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                  {appointment.patient.email}
                </p>
                <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                  {appointment.patient.phoneNumber}
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 sm:p-3.5">
                <p className="text-foreground dark:text-foreground mb-2 flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"></div>
                  Médico
                </p>
                <p className="text-foreground dark:text-foreground text-xs font-medium sm:text-sm">
                  Dr. {appointment.doctor.name}
                </p>
                <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                  {appointment.doctor.specialty}
                </p>
              </div>
            </div>
          </div>

          {/* Footer com botões - só mostrar se não for médico */}
          {!isDoctor && (
            <div className="bg-muted/20 dark:bg-muted/5 border-border/50 dark:border-border/50 border-t p-3 sm:p-4">
              <div className="flex gap-2">
                {canConfirm && onConfirm && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onConfirm(appointment);
                      setIsOpen(false);
                    }}
                    className="flex-1 cursor-pointer border-0 bg-emerald-600 text-xs text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none sm:text-sm"
                    title="Confirmar agendamento"
                    aria-label="Confirmar agendamento"
                  >
                    <Check className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Confirmar
                  </Button>
                )}

                {canEdit && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(appointment);
                      setIsOpen(false);
                    }}
                    className="border-border dark:border-border hover:bg-accent dark:hover:bg-accent flex-1 cursor-pointer text-xs shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:text-sm"
                    title="Editar agendamento"
                    aria-label="Editar agendamento"
                  >
                    <Edit className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Editar
                  </Button>
                )}

                {canCancel && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCancel(appointment);
                      setIsOpen(false);
                    }}
                    className="flex-1 cursor-pointer border-red-200 text-xs text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-md focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none sm:text-sm dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/20"
                    title="Cancelar agendamento"
                    aria-label="Cancelar agendamento"
                  >
                    <X className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

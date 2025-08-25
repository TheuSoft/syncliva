"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
            "group relative cursor-pointer rounded border p-1.5 text-xs transition-all duration-200 sm:p-2",
            getStatusColor(appointment.status),
            "min-h-0 hover:scale-[1.02] hover:shadow-sm",
            className,
          )}
        >
          <div className="mb-1 flex items-start justify-between">
            <div className="text-[9px] leading-tight font-semibold sm:text-[10px]">
              {format(appointment.date, "HH:mm")}
            </div>
            <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreVertical className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <div className="truncate text-[9px] leading-tight font-medium sm:text-[11px]">
              {appointment.patient.name}
            </div>
            <div className="truncate text-[8px] leading-tight opacity-75 sm:text-[10px]">
              Dr. {appointment.doctor.name}
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[8px] leading-tight opacity-60 sm:text-[9px]">
                {formatCurrencyInCents(appointment.appointmentPriceInCents)}
              </span>
              <span
                className={cn(
                  "flex-shrink-0 rounded px-1 py-0.5 text-[7px] leading-none font-bold uppercase sm:text-[8px]",
                  appointment.status === "confirmed" &&
                    "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200",
                  appointment.status === "pending" &&
                    "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
                  appointment.status === "canceled" &&
                    "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
                )}
              >
                {getStatusLabel(appointment.status).substring(0, 4)}
              </span>
            </div>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 border-0 p-0 shadow-xl" align="start">
        <div className="bg-background dark:bg-background border-border dark:border-border overflow-hidden rounded-xl border shadow-2xl">
          {/* Header com data e valor */}
          <div className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-border/50 dark:border-border/50 border-b bg-gradient-to-r p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-foreground dark:text-foreground text-base font-bold">
                  {format(appointment.date, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </h4>
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    appointment.status === "confirmed"
                      ? "border border-green-200 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : appointment.status === "pending"
                        ? "border border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        : "border border-red-200 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300"
                  }`}
                >
                  {getStatusLabel(appointment.status)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary dark:text-primary text-xl font-bold">
                  {formatCurrencyInCents(appointment.appointmentPriceInCents)}
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="space-y-4 p-4">
            <div>
              <p className="text-foreground dark:text-foreground mb-1 text-sm font-semibold">
                Paciente:
              </p>
              <p className="text-foreground dark:text-foreground text-sm font-medium">
                {appointment.patient.name}
              </p>
              <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                {appointment.patient.email}
              </p>
              <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                {appointment.patient.phoneNumber}
              </p>
            </div>

            <div>
              <p className="text-foreground dark:text-foreground mb-1 text-sm font-semibold">
                Médico:
              </p>
              <p className="text-foreground dark:text-foreground text-sm font-medium">
                Dr. {appointment.doctor.name}
              </p>
              <p className="text-muted-foreground dark:text-muted-foreground text-xs">
                {appointment.doctor.specialty}
              </p>
            </div>
          </div>

          {/* Footer com botões - só mostrar se não for médico */}
          {!isDoctor && (
            <div className="bg-muted/20 dark:bg-muted/5 border-border/50 dark:border-border/50 border-t p-4">
              <div className="flex gap-2">
                {canConfirm && onConfirm && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onConfirm(appointment);
                      setIsOpen(false);
                    }}
                    className="flex-1 border-0 bg-green-600 text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md"
                    title="Confirmar agendamento"
                  >
                    <Check className="h-4 w-4" />
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
                    className="border-border dark:border-border hover:bg-accent dark:hover:bg-accent flex-1 shadow-sm transition-all hover:shadow-md"
                    title="Editar agendamento"
                  >
                    <Edit className="h-4 w-4" />
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
                    className="flex-1 border-red-200 text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-md dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/20"
                    title="Cancelar agendamento"
                  >
                    <X className="h-4 w-4" />
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

"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Calendar, Check, Edit, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface DayAppointmentsModalProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditAppointment?: (appointment: AppointmentWithRelations) => void;
  onConfirmAppointment?: (appointment: AppointmentWithRelations) => void;
  onCancelAppointment?: (appointment: AppointmentWithRelations) => void;
  isDoctor?: boolean; // Indica se estamos na visualização do médico
}

export function DayAppointmentsModal({
  date,
  appointments,
  isOpen,
  onOpenChange,
  onEditAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  isDoctor = false,
}: DayAppointmentsModalProps) {
  const sortedAppointments = appointments.sort(
    (a, b) =>
      dayjs(a.date).tz(BRAZIL_TIMEZONE).toDate().getTime() -
      dayjs(b.date).tz(BRAZIL_TIMEZONE).toDate().getTime(),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-9xl md:max-w-8xl max-h-[98vh] w-full max-w-[99vw] overflow-hidden border-0 p-0 shadow-2xl sm:max-h-[95vh] sm:max-w-7xl xl:max-w-[95vw] 2xl:max-w-[90vw]">
        <div className="bg-background overflow-hidden rounded-xl">
          {/* Header com gradiente */}
          <div className="from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 border-border/50 border-b bg-gradient-to-r p-4 sm:p-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-foreground flex items-center gap-3 text-lg font-bold sm:text-xl">
                <div className="bg-background/50 border-border/30 rounded-lg border p-2">
                  <Calendar className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div>
                    Agendamentos -{" "}
                    {format(date, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <p className="text-muted-foreground text-sm font-normal">
                    {format(date, "EEEE", { locale: ptBR })
                      .charAt(0)
                      .toUpperCase() +
                      format(date, "EEEE", { locale: ptBR }).slice(1)}
                  </p>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2 pt-2">
                <div className="bg-background/70 border-border/50 rounded-full border px-3 py-1.5">
                  <span className="text-foreground text-sm font-semibold">
                    {appointments.length} agendamento
                    {appointments.length !== 1 ? "s" : ""} neste dia
                  </span>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="overflow-container max-h-[70vh] overflow-y-auto pr-1 sm:max-h-[75vh] sm:pr-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {sortedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="from-background to-muted/20 border-border/40 hover:border-primary/30 hover:from-primary/5 hover:to-primary/10 group flex h-full min-h-[140px] flex-col rounded-xl border-2 bg-gradient-to-br p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:p-4 lg:p-5"
                  >
                    <div className="flex-1 space-y-3">
                      {/* Header com horário e status */}
                      <div className="flex items-start justify-between">
                        <div className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2 py-1 text-sm font-bold shadow-sm sm:px-3 sm:py-1.5 sm:text-base">
                          {format(
                            dayjs(appointment.date)
                              .tz(BRAZIL_TIMEZONE)
                              .toDate(),
                            "HH:mm",
                          )}
                        </div>
                        <div
                          className={`rounded-full border px-1.5 py-1 text-xs font-semibold shadow-sm sm:px-2 sm:py-1.5 ${
                            appointment.status === "confirmed"
                              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:border-emerald-700 dark:from-emerald-900/40 dark:to-emerald-800/40 dark:text-emerald-300"
                              : appointment.status === "pending"
                                ? "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 dark:border-amber-700 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300"
                                : "border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 dark:border-rose-700 dark:from-rose-900/40 dark:to-rose-800/40 dark:text-rose-300"
                          }`}
                        >
                          {appointment.status === "confirmed" ? (
                            <Check className="h-2 w-2 sm:h-3 sm:w-3" />
                          ) : appointment.status === "pending" ? (
                            <div className="h-2 w-2 rounded-full bg-amber-500 sm:h-3 sm:w-3" />
                          ) : (
                            <X className="h-2 w-2 sm:h-3 sm:w-3" />
                          )}
                        </div>
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 space-y-2">
                        <div className="bg-muted/30 rounded-lg p-2 sm:p-2.5">
                          <h4 className="text-foreground mb-1 truncate text-sm font-semibold sm:text-base">
                            {appointment.patient.name}
                          </h4>
                          <p className="text-muted-foreground truncate text-xs sm:text-sm">
                            {appointment.patient.email}
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-2 sm:p-2.5">
                          <p className="text-foreground mb-1 text-sm font-medium sm:text-base">
                            Dr. {appointment.doctor.name}
                          </p>
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            {appointment.doctor.specialty}
                          </p>
                        </div>

                        <div className="bg-primary/10 border-primary/20 rounded-lg border p-2 sm:p-2.5">
                          <p className="text-primary text-sm font-bold sm:text-base">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(
                              appointment.appointmentPriceInCents / 100,
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      {!isDoctor && (
                        <div className="mt-auto flex items-center justify-center gap-2 pt-4">
                          {appointment.status === "pending" &&
                            onConfirmAppointment && (
                              <button
                                onClick={() => {
                                  onConfirmAppointment(appointment);
                                  onOpenChange(false);
                                }}
                                className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none sm:px-5 sm:py-2.5"
                                title="Confirmar agendamento"
                                aria-label="Confirmar agendamento"
                              >
                                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            )}

                          {appointment.status !== "canceled" &&
                            onEditAppointment && (
                              <button
                                onClick={() => {
                                  onEditAppointment(appointment);
                                  onOpenChange(false);
                                }}
                                className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:px-5 sm:py-2.5"
                                title="Editar agendamento"
                                aria-label="Editar agendamento"
                              >
                                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            )}

                          {appointment.status !== "canceled" &&
                            onCancelAppointment && (
                              <button
                                onClick={() => {
                                  onCancelAppointment(appointment);
                                  onOpenChange(false);
                                }}
                                className="flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:outline-none sm:px-5 sm:py-2.5"
                                title="Cancelar agendamento"
                                aria-label="Cancelar agendamento"
                              >
                                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

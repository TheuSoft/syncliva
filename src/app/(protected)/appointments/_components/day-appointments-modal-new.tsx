"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Check, Edit, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppointmentWithRelations } from "@/types/appointments";

interface DayAppointmentsModalProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditAppointment?: (appointment: AppointmentWithRelations) => void;
  onConfirmAppointment?: (appointment: AppointmentWithRelations) => void;
  onCancelAppointment?: (appointment: AppointmentWithRelations) => void;
}

export function DayAppointmentsModal({
  date,
  appointments,
  isOpen,
  onOpenChange,
  onEditAppointment,
  onConfirmAppointment,
  onCancelAppointment,
}: DayAppointmentsModalProps) {
  const sortedAppointments = appointments.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-hidden border-0 p-0 shadow-2xl sm:max-h-[85vh] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
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
          <div className="p-4 sm:p-6">
            <div className="max-h-[60vh] overflow-y-auto pr-1 sm:max-h-[65vh] sm:pr-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {sortedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="from-background to-muted/20 border-border/40 hover:border-primary/30 hover:from-primary/5 hover:to-primary/10 group rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:p-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="text-primary bg-primary/10 border-primary/20 rounded-full border px-3 py-1.5 text-lg font-bold shadow-sm">
                          {format(appointment.date, "HH:mm")}
                        </div>
                        <div
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${
                            appointment.status === "confirmed"
                              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:border-emerald-700 dark:from-emerald-900/40 dark:to-emerald-800/40 dark:text-emerald-300"
                              : appointment.status === "pending"
                                ? "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 dark:border-amber-700 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300"
                                : "border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 dark:border-rose-700 dark:from-rose-900/40 dark:to-rose-800/40 dark:text-rose-300"
                          }`}
                        >
                          {appointment.status === "confirmed"
                            ? "Confirmado"
                            : appointment.status === "pending"
                              ? "Pendente"
                              : "Cancelado"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-muted/30 border-border/30 rounded-lg border p-3">
                          <p className="text-foreground mb-1 truncate text-sm font-semibold">
                            {appointment.patient.name}
                          </p>
                          <div className="space-y-1">
                            <p className="text-muted-foreground truncate text-xs">
                              📧 {appointment.patient.email}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              📱 {appointment.patient.phoneNumber}
                            </p>
                          </div>
                        </div>

                        <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
                          <p className="text-foreground mb-1 truncate text-sm font-medium">
                            👨‍⚕️ Dr. {appointment.doctor.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {appointment.doctor.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="border-border/30 flex flex-col gap-3 border-t pt-4">
                        <div className="text-center">
                          <div className="text-primary from-primary/10 to-primary/5 border-primary/20 rounded-lg border bg-gradient-to-r px-4 py-2 text-xl font-bold">
                            R${" "}
                            {(appointment.appointmentPriceInCents / 100)
                              .toFixed(2)
                              .replace(".", ",")}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {appointment.status === "pending" &&
                            onConfirmAppointment && (
                              <button
                                onClick={() =>
                                  onConfirmAppointment(appointment)
                                }
                                className="flex flex-1 transform items-center justify-center rounded-lg border border-emerald-400 bg-gradient-to-r from-emerald-500 to-emerald-600 p-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md"
                                title="Confirmar agendamento"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}

                          {appointment.status !== "canceled" &&
                            onEditAppointment && (
                              <button
                                onClick={() => onEditAppointment(appointment)}
                                className="flex flex-1 transform items-center justify-center rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-2.5 font-medium text-blue-700 shadow-sm transition-all duration-200 hover:scale-105 hover:from-blue-100 hover:to-blue-200 hover:shadow-md dark:border-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:hover:from-blue-900/60 dark:hover:to-blue-800/60"
                                title="Editar agendamento"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}

                          {["pending", "confirmed"].includes(
                            appointment.status,
                          ) &&
                            onCancelAppointment && (
                              <button
                                onClick={() => onCancelAppointment(appointment)}
                                className="flex flex-1 transform items-center justify-center rounded-lg border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 p-2.5 font-medium text-rose-700 shadow-sm transition-all duration-200 hover:scale-105 hover:from-rose-100 hover:to-rose-200 hover:shadow-md dark:border-rose-700 dark:from-rose-900/40 dark:to-rose-800/40 dark:text-rose-300 dark:hover:from-rose-900/60 dark:hover:to-rose-800/60"
                                title="Cancelar agendamento"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer com estatísticas */}
          <div className="from-muted/20 to-muted/10 border-border/30 border-t bg-gradient-to-r p-4 sm:p-6">
            <div className="flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap sm:gap-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm"></div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Confirmados:{" "}
                    <span className="font-bold">
                      {
                        sortedAppointments.filter(
                          (a) => a.status === "confirmed",
                        ).length
                      }
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-900/20">
                  <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm"></div>
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    Pendentes:{" "}
                    <span className="font-bold">
                      {
                        sortedAppointments.filter((a) => a.status === "pending")
                          .length
                      }
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-800 dark:bg-rose-900/20">
                  <div className="h-3 w-3 rounded-full bg-rose-500 shadow-sm"></div>
                  <span className="font-medium text-rose-700 dark:text-rose-300">
                    Cancelados:{" "}
                    <span className="font-bold">
                      {
                        sortedAppointments.filter(
                          (a) => a.status === "canceled",
                        ).length
                      }
                    </span>
                  </span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="from-primary/10 to-primary/5 border-primary/20 rounded-lg border bg-gradient-to-r px-4 py-2">
                  <span className="text-primary font-semibold">
                    Total:{" "}
                    <span className="font-bold">
                      {sortedAppointments.length}
                    </span>{" "}
                    agendamentos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const sortedAppointments = appointments.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden p-0 border-0 shadow-2xl">
        <div className="bg-background dark:bg-background rounded-xl overflow-hidden">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 p-4 sm:p-6 border-b border-border/50 dark:border-border/50">
            <DialogHeader className="space-y-2">
              <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-foreground dark:text-foreground">
                <div className="p-2 bg-background/50 dark:bg-background/50 rounded-lg border border-border/30">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <div>Agendamentos - {format(date, "dd/MM/yyyy", { locale: ptBR })}</div>
                  <p className="text-sm font-normal text-muted-foreground dark:text-muted-foreground">
                    {format(date, "EEEE", { locale: ptBR }).charAt(0).toUpperCase() + format(date, "EEEE", { locale: ptBR }).slice(1)}
                  </p>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2 pt-2">
                <div className="bg-background/70 dark:bg-background/70 px-3 py-1.5 rounded-full border border-border/50">
                  <span className="text-sm font-semibold text-foreground dark:text-foreground">
                    {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} neste dia
                  </span>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Conteúdo principal */}
          <div className="p-4 sm:p-6">
            <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto pr-1 sm:pr-2">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="bg-gradient-to-br from-background to-muted/20 border border-border/40 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:from-primary/5 hover:to-primary/10 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-lg text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                        {format(appointment.date, "HH:mm")}
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
                        appointment.status === "confirmed" 
                          ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 dark:text-emerald-300 dark:border-emerald-700" 
                          : appointment.status === "pending"
                          ? "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300 dark:border-amber-700"
                          : "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 dark:text-rose-300 dark:border-rose-700"
                      }`}>
                        {appointment.status === "confirmed" 
                          ? "Confirmado" 
                          : appointment.status === "pending"
                          ? "Pendente"
                          : "Cancelado"
                        }
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                        <p className="font-semibold text-foreground text-sm mb-1 truncate">{appointment.patient.name}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground truncate">
                            📧 {appointment.patient.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📱 {appointment.patient.phoneNumber}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                        <p className="text-sm font-medium text-foreground truncate mb-1">
                          👨‍⚕️ Dr. {appointment.doctor.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {appointment.doctor.specialty}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4 border-t border-border/30">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                          R$ {(appointment.appointmentPriceInCents / 100).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {appointment.status === "pending" && onConfirmAppointment && (
                          <button
                            onClick={() => onConfirmAppointment(appointment)}
                            className="flex-1 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 border border-emerald-400"
                            title="Confirmar agendamento"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        
                        {appointment.status !== "canceled" && onEditAppointment && (
                          <button
                            onClick={() => onEditAppointment(appointment)}
                            className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/60 dark:hover:to-blue-800/60 p-2.5 rounded-lg font-medium transition-all duration-200 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transform hover:scale-105"
                            title="Editar agendamento"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        
                        {["pending", "confirmed"].includes(appointment.status) && onCancelAppointment && (
                          <button
                            onClick={() => onCancelAppointment(appointment)}
                            className="flex-1 flex items-center justify-center bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/40 text-rose-700 dark:text-rose-300 hover:from-rose-100 hover:to-rose-200 dark:hover:from-rose-900/60 dark:hover:to-rose-800/60 p-2.5 rounded-lg font-medium transition-all duration-200 border border-rose-200 dark:border-rose-700 shadow-sm hover:shadow-md transform hover:scale-105"
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

          {/* Footer com estatísticas */}
          <div className="bg-gradient-to-r from-muted/20 to-muted/10 p-4 sm:p-6 border-t border-border/30">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Confirmados: <span className="font-bold">{sortedAppointments.filter(a => a.status === "confirmed").length}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    Pendentes: <span className="font-bold">{sortedAppointments.filter(a => a.status === "pending").length}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                  <span className="font-medium text-rose-700 dark:text-rose-300">
                    Cancelados: <span className="font-bold">{sortedAppointments.filter(a => a.status === "canceled").length}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <span className="font-semibold text-primary">
                    Total: <span className="font-bold">{sortedAppointments.length}</span> agendamentos
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
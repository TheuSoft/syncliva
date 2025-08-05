"use client";

import { format, isAfter, isBefore, isToday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AppointmentWithRelations } from "@/types/appointments";

import { AppointmentActions } from "./appointment-actions";

interface AppointmentsTimelineProps {
  appointments: AppointmentWithRelations[];
  onEdit: (appointment: AppointmentWithRelations) => void;
  doctorId?: string;
  isDoctor?: boolean; // Indica se estamos no dashboard do médico
}

interface GroupedAppointments {
  monthYear: string;
  appointments: AppointmentWithRelations[];
}

export function AppointmentsTimeline({ appointments, onEdit, doctorId, isDoctor = false }: AppointmentsTimelineProps) {
  // Filtrar apenas os agendamentos do médico se doctorId for fornecido
  const filteredAppointments = doctorId 
    ? appointments.filter(appointment => appointment.doctorId === doctorId) 
    : appointments;
  const groupedAppointments = useMemo(() => {
    // Ordenar por data (mais recentes primeiro)
    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Agrupar por mês/ano
    const groups: GroupedAppointments[] = [];
    const monthGroups = new Map<string, AppointmentWithRelations[]>();

    sortedAppointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);
      let monthYear = format(appointmentDate, "MMMM 'de' yyyy", { locale: ptBR });
      // Capitalizar a primeira letra do mês
      monthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      
      if (!monthGroups.has(monthYear)) {
        monthGroups.set(monthYear, []);
      }
      monthGroups.get(monthYear)!.push(appointment);
    });

    // Converter para array e ordenar meses (mais recentes primeiro)
    monthGroups.forEach((appointments, monthYear) => {
      groups.push({ monthYear, appointments });
    });

    return groups.sort((a, b) => {
      const dateA = new Date(a.appointments[0].date);
      const dateB = new Date(b.appointments[0].date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredAppointments]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: "Pendente", 
        variant: "secondary" as const, 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800" 
      },
      confirmed: { 
        label: "Confirmado", 
        variant: "default" as const, 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800" 
      },
      canceled: { 
        label: "Cancelado", 
        variant: "destructive" as const, 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800" 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getDateStatus = (appointmentDate: Date) => {
    const today = startOfDay(new Date());
    const appDate = startOfDay(appointmentDate);

    if (isToday(appointmentDate)) {
      return { label: "Hoje", className: "text-blue-600 dark:text-blue-400 font-semibold" };
    } else if (isBefore(appDate, today)) {
      return { label: "Passou", className: "text-muted-foreground" };
    } else if (isAfter(appDate, today)) {
      return { label: "Futuro", className: "text-green-600 dark:text-green-400" };
    }
    return { label: "", className: "" };
  };

  if (groupedAppointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-muted-foreground text-center">Não há agendamentos para exibir no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {groupedAppointments.map(({ monthYear, appointments: monthAppointments }) => (
        <div key={monthYear} className="space-y-4">
          {/* Header do Mês */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-primary capitalize">
              {monthYear}
            </h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
              {monthAppointments.length} agendamento{monthAppointments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Lista de Agendamentos do Mês */}
          <div className="grid gap-4">
            {monthAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.date);
              const dateStatus = getDateStatus(appointmentDate);
              const price = appointment.appointmentPriceInCents / 100;

              return (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      {/* Informações principais */}
                      <div className="flex-1 space-y-2">
                        {/* Data e hora */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm text-primary">
                            {(() => {
                              const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
                              return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
                            })()}
                          </span>
                          <span className="text-secondary-foreground text-sm">
                            às {format(appointmentDate, "HH:mm")}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full bg-secondary/30 ${dateStatus.className}`}>
                            {dateStatus.label}
                          </span>
                        </div>

                        {/* Paciente */}
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-primary text-sm">
                            {appointment.patient.name}
                          </span>
                          {appointment.patient.phoneNumber && (
                            <span className="text-xs text-muted-foreground">
                              • {appointment.patient.phoneNumber}
                            </span>
                          )}
                        </div>

                        {/* Médico e especialidade */}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-primary text-sm">
                            Dr(a). {appointment.doctor.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {appointment.doctor.specialty}
                          </span>
                        </div>

                        {/* Valor */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(price)}
                          </span>
                        </div>
                      </div>

                      {/* Status e ações */}
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(appointment.status || 'pending')}
                        {!isDoctor && (
                          <AppointmentActions appointment={appointment} onEdit={onEdit} />
                        )}
                        {isDoctor && (
                          <div className="text-xs text-muted-foreground italic mt-1">
                            Edição via administrador
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

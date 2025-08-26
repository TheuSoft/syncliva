"use client";

import { format, isAfter, isBefore, isToday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Stethoscope, User } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { convertToLocalDate } from "@/helpers/date";
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

export function AppointmentsTimeline({
  appointments,
  onEdit,
  doctorId,
  isDoctor = false,
}: AppointmentsTimelineProps) {
  // Filtrar apenas os agendamentos do médico se doctorId for fornecido
  const filteredAppointments = doctorId
    ? appointments.filter((appointment) => appointment.doctorId === doctorId)
    : appointments;
  const groupedAppointments = useMemo(() => {
    // Ordenar por data (mais recentes primeiro)
    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
      return (
        convertToLocalDate(b.date).getTime() -
        convertToLocalDate(a.date).getTime()
      );
    });

    // Agrupar por mês/ano
    const groups: GroupedAppointments[] = [];
    const monthGroups = new Map<string, AppointmentWithRelations[]>();

    sortedAppointments.forEach((appointment) => {
      const appointmentDate = convertToLocalDate(appointment.date);
      let monthYear = format(appointmentDate, "MMMM 'de' yyyy", {
        locale: ptBR,
      });
      // Capitalizar a primeira letra do mês
      monthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

      if (!monthGroups.has(monthYear)) {
        monthGroups.set(monthYear, []);
      }
      monthGroups.get(monthYear)!.push(appointment);
    });

    // Converter para array e extrair dados para ordenação personalizada
    monthGroups.forEach((appointments, monthYear) => {
      groups.push({ monthYear, appointments });
    });

    // Capturar o mês e ano atual
    const now = new Date();
    const currentMonthYear = format(now, "MMMM 'de' yyyy", { locale: ptBR });
    const currentMonthYearCapitalized =
      currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);

    // Ordenação inteligente: mês atual primeiro, meses futuros depois em ordem cronológica, meses passados por último
    return groups.sort((a, b) => {
      // Extrair mês e ano de cada grupo
      const monthYearA = a.monthYear;
      const monthYearB = b.monthYear;

      // Se um dos grupos é o mês atual, ele tem prioridade
      if (monthYearA === currentMonthYearCapitalized) return -1;
      if (monthYearB === currentMonthYearCapitalized) return 1;

      // Para os demais, usamos a data do primeiro agendamento para ordenação
      const dateA = convertToLocalDate(a.appointments[0].date);
      const dateB = convertToLocalDate(b.appointments[0].date);

      // Verificar se os meses são futuros ou passados em relação ao mês atual
      const isMonthAFuture = isAfter(dateA, now);
      const isMonthBFuture = isAfter(dateB, now);

      // Se ambos são futuros ou ambos são passados, ordenamos cronologicamente
      if (
        (isMonthAFuture && isMonthBFuture) ||
        (!isMonthAFuture && !isMonthBFuture)
      ) {
        // Meses futuros em ordem crescente (mais próximos primeiro)
        // Meses passados em ordem decrescente (mais recentes primeiro)
        return isMonthAFuture
          ? dateA.getTime() - dateB.getTime() // Crescente para futuros
          : dateB.getTime() - dateA.getTime(); // Decrescente para passados
      }

      // Se um é futuro e outro é passado, o futuro vem antes
      return isMonthAFuture ? -1 : 1;
    });
  }, [filteredAppointments]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pendente",
        className:
          "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 dark:from-yellow-900/40 dark:to-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
      },
      confirmed: {
        label: "Confirmado",
        className:
          "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200 dark:from-green-900/40 dark:to-green-900/20 dark:text-green-300 dark:border-green-800",
      },
      canceled: {
        label: "Cancelado",
        className:
          "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200 dark:from-red-900/40 dark:to-red-900/20 dark:text-red-300 dark:border-red-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge
        className={`${config.className} px-3 py-1 text-xs font-medium shadow-sm`}
      >
        {config.label}
      </Badge>
    );
  };

  const getDateStatus = (appointmentDate: Date) => {
    const today = startOfDay(new Date());
    const appDate = startOfDay(appointmentDate);

    if (isToday(appointmentDate)) {
      return {
        label: "Hoje",
        className:
          "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 dark:from-blue-900/40 dark:to-blue-900/20 dark:text-blue-300 dark:border-blue-800",
      };
    } else if (isBefore(appDate, today)) {
      return {
        label: "Passado",
        className:
          "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200 dark:from-gray-900/40 dark:to-gray-900/20 dark:text-gray-300 dark:border-gray-800",
      };
    } else if (isAfter(appDate, today)) {
      return {
        label: "Futuro",
        className:
          "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 dark:from-emerald-900/40 dark:to-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
      };
    }
    return { label: "", className: "" };
  };

  if (groupedAppointments.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-muted/50 mb-6 rounded-full p-6">
            <Calendar className="text-muted-foreground h-12 w-12" />
          </div>
          <h3 className="text-foreground mb-3 text-xl font-semibold">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-muted-foreground text-center">
            Não há agendamentos para exibir no momento.
            <br />
            Quando houver novos agendamentos, eles aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {groupedAppointments.map(
        ({ monthYear, appointments: monthAppointments }) => (
          <div key={monthYear} className="space-y-6">
            {/* Header do Mês */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <div className="bg-background px-6 py-2">
                  <div className="from-primary/10 to-primary/5 flex items-center gap-3 rounded-full bg-gradient-to-r px-4 py-2 shadow-sm">
                    <Calendar className="text-primary h-5 w-5" />
                    <h2 className="text-primary text-xl font-semibold capitalize">
                      {monthYear}
                    </h2>
                    <div className="bg-primary/20 ml-2 rounded-full px-3 py-1">
                      <span className="text-primary text-sm font-medium">
                        {monthAppointments.length} agendamento
                        {monthAppointments.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos do Mês */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {monthAppointments.map((appointment) => {
                const appointmentDate = convertToLocalDate(appointment.date);
                const dateStatus = getDateStatus(appointmentDate);
                const price = appointment.appointmentPriceInCents / 100;

                return (
                  <Card
                    key={appointment.id}
                    className="group border-l-primary/20 from-background to-muted/10 hover:border-l-primary hover:shadow-primary/5 relative overflow-hidden border-l-4 bg-gradient-to-r transition-all duration-200 hover:shadow-lg"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header com status e data */}
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${dateStatus.className}`}
                          >
                            <Calendar className="h-3 w-3" />
                            {dateStatus.label}
                          </div>
                          <div className="text-primary flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            <span>{format(appointmentDate, "dd/MM")}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{format(appointmentDate, "HH:mm")}</span>
                          </div>
                        </div>

                        {/* Informações principais */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Paciente */}
                          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {appointment.patient.name}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                Paciente
                              </p>
                            </div>
                          </div>

                          {/* Médico */}
                          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                              <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                Dr(a). {appointment.doctor.name}
                              </p>
                              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                {appointment.doctor.specialty}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer com status, valor e ações */}
                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="flex items-center gap-3">
                            {getStatusBadge(appointment.status || "pending")}
                            <div className="text-right">
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            {!isDoctor && (
                              <AppointmentActions
                                appointment={appointment}
                                onEdit={onEdit}
                              />
                            )}
                            {isDoctor && (
                              <span className="text-muted-foreground text-xs italic">
                                Gerenciado pelo admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

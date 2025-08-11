"use client";

import { format, isAfter, isBefore, isToday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Stethoscope, User } from "lucide-react";
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
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Agrupar por mês/ano
    const groups: GroupedAppointments[] = [];
    const monthGroups = new Map<string, AppointmentWithRelations[]>();

    sortedAppointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);
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
      const dateA = new Date(a.appointments[0].date);
      const dateB = new Date(b.appointments[0].date);

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
        variant: "secondary" as const,
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
      },
      confirmed: {
        label: "Agendamento pago",
        variant: "default" as const,
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      },
      canceled: {
        label: "Cancelado",
        variant: "destructive" as const,
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge
        variant={config.variant}
        className={`${config.className} px-2 py-0.5 text-xs`}
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
        className: "text-blue-600 dark:text-blue-400 font-semibold",
      };
    } else if (isBefore(appDate, today)) {
      return { label: "Passou", className: "text-muted-foreground" };
    } else if (isAfter(appDate, today)) {
      return {
        label: "Futuro",
        className: "text-green-600 dark:text-green-400",
      };
    }
    return { label: "", className: "" };
  };

  if (groupedAppointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-primary mb-2 text-lg font-medium">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-muted-foreground text-center">
            Não há agendamentos para exibir no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {groupedAppointments.map(
        ({ monthYear, appointments: monthAppointments }) => (
          <div key={monthYear} className="space-y-4">
            {/* Header do Mês */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-primary text-xl font-semibold capitalize">
                {monthYear}
              </h2>
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground bg-secondary/30 rounded-full px-3 py-1 text-sm">
                {monthAppointments.length} agendamento
                {monthAppointments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Lista de Agendamentos do Mês */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {monthAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const dateStatus = getDateStatus(appointmentDate);
                const price = appointment.appointmentPriceInCents / 100;

                return (
                  <Card
                    key={appointment.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Status centralizado no topo */}
                        <div className="flex justify-center">
                          <span
                            className={`bg-secondary/30 rounded-full px-2 py-1 text-xs font-medium ${dateStatus.className}`}
                          >
                            {dateStatus.label}
                          </span>
                        </div>

                        {/* Data e hora centralizadas com ações na mesma linha */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex-1"></div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                            <span className="text-primary font-medium">
                              {format(appointmentDate, "dd/MM")}
                            </span>
                            <span className="text-secondary-foreground font-medium">
                              {format(appointmentDate, "HH:mm")}
                            </span>
                          </div>
                          <div className="flex flex-1 justify-end">
                            {!isDoctor && (
                              <AppointmentActions
                                appointment={appointment}
                                onEdit={onEdit}
                              />
                            )}
                            {isDoctor && (
                              <div className="text-muted-foreground text-xs italic">
                                Via admin
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Paciente */}
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                          <span className="truncate text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {appointment.patient.name}
                          </span>
                        </div>

                        {/* Médico e especialidade */}
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="h-4 w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium text-blue-700 dark:text-blue-300">
                              Dr(a). {appointment.doctor.name}
                            </span>
                            <span className="truncate text-xs text-blue-600 dark:text-blue-400">
                              {appointment.doctor.specialty}
                            </span>
                          </div>
                        </div>

                        {/* Espaçamento antes do status */}
                        <div className="pt-2">
                          {/* Status */}
                          <div className="flex justify-center">
                            {getStatusBadge(appointment.status || "pending")}
                          </div>

                          {/* Valor centralizado */}
                          <div className="flex justify-center pt-1.5">
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(price)}
                            </span>
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

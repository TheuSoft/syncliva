"use server";

import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface GroupedAppointments {
  monthYear: string;
  appointments: AppointmentWithRelations[];
}

interface GetGroupedAppointmentsParams {
  appointments: AppointmentWithRelations[];
  doctorId?: string;
}

export async function getGroupedAppointments({
  appointments,
  doctorId,
}: GetGroupedAppointmentsParams): Promise<GroupedAppointments[]> {
  // Filtrar apenas os agendamentos do médico se doctorId for fornecido
  const filteredAppointments = doctorId
    ? appointments.filter((appointment) => appointment.doctorId === doctorId)
    : appointments;

  if (filteredAppointments.length === 0) {
    return [];
  }

  // Ordenar por data (mais recentes primeiro)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return (
      dayjs(b.date).tz(BRAZIL_TIMEZONE).toDate().getTime() -
      dayjs(a.date).tz(BRAZIL_TIMEZONE).toDate().getTime()
    );
  });

  // Agrupar por mês/ano
  const groups: GroupedAppointments[] = [];
  const monthGroups = new Map<string, AppointmentWithRelations[]>();

  sortedAppointments.forEach((appointment) => {
    const appointmentDate = dayjs(appointment.date)
      .tz(BRAZIL_TIMEZONE)
      .toDate();
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
    const dateA = dayjs(a.appointments[0].date).tz(BRAZIL_TIMEZONE).toDate();
    const dateB = dayjs(b.appointments[0].date).tz(BRAZIL_TIMEZONE).toDate();

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
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    // Se um é futuro e outro é passado, o futuro vem primeiro
    return isMonthAFuture ? -1 : 1;
  });
}

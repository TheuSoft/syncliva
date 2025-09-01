"use server";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface MonthGroup {
  label: string;
  appointments: AppointmentWithRelations[];
}

interface GetAppointmentsGroupedByMonthParams {
  appointments: AppointmentWithRelations[];
}

export async function getAppointmentsGroupedByMonth({
  appointments,
}: GetAppointmentsGroupedByMonthParams): Promise<MonthGroup[]> {
  if (appointments.length === 0) {
    return [];
  }

  // Agrupar agendamentos por mês
  const appointmentsByMonth = appointments.reduce(
    (acc, appointment) => {
      const appointmentDate = dayjs(appointment.date)
        .tz(BRAZIL_TIMEZONE)
        .toDate();
      const monthKey = format(appointmentDate, "yyyy-MM");
      const monthLabel = format(appointmentDate, "MMMM 'de' yyyy", {
        locale: ptBR,
      });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
          appointments: [],
        };
      }
      acc[monthKey].appointments.push(appointment);
      return acc;
    },
    {} as Record<string, MonthGroup>,
  );

  // Converter para array e ordenar
  const sortedMonths = Object.entries(appointmentsByMonth).sort(([a], [b]) =>
    b.localeCompare(a),
  );

  // Ordenar agendamentos dentro de cada mês por proximidade da data atual
  sortedMonths.forEach(([, monthData]) => {
    monthData.appointments.sort((a, b) => {
      const today = dayjs().tz(BRAZIL_TIMEZONE).startOf("day");
      const dateA = dayjs(a.date).tz(BRAZIL_TIMEZONE).startOf("day");
      const dateB = dayjs(b.date).tz(BRAZIL_TIMEZONE).startOf("day");

      // Calcular diferença em dias da data atual
      const diffA = dateA.diff(today, "day");
      const diffB = dateB.diff(today, "day");

      // Se ambos são passados ou futuros, ordenar por proximidade
      if ((diffA >= 0 && diffB >= 0) || (diffA < 0 && diffB < 0)) {
        return Math.abs(diffA) - Math.abs(diffB);
      }

      // Agendamentos futuros vêm antes dos passados
      return diffA >= 0 ? -1 : 1;
    });
  });

  return sortedMonths.map(([, monthData]) => monthData);
}

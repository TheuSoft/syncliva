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

interface MonthOption {
  key: string;
  label: string;
}

interface YearGroup {
  [year: string]: MonthOption[];
}

interface AvailableMonthsResult {
  groupedByYear: YearGroup;
  sortedYears: string[];
}

interface GetAvailableMonthsParams {
  appointments: AppointmentWithRelations[];
}

export async function getAvailableMonths({
  appointments,
}: GetAvailableMonthsParams): Promise<AvailableMonthsResult> {
  // Extrair todos os meses únicos dos agendamentos
  const uniqueMonths = [
    ...new Set(
      appointments.map((appointment) => {
        const appointmentDate = dayjs(appointment.date)
          .tz(BRAZIL_TIMEZONE)
          .toDate();
        return format(appointmentDate, "yyyy-MM");
      }),
    ),
  ];

  // Converter para objetos com key e label
  const months: MonthOption[] = uniqueMonths.map((monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    let label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    // Capitalizar primeira letra
    label = label.charAt(0).toUpperCase() + label.slice(1);

    return {
      key: monthKey,
      label,
    };
  });

  // Agrupar por ano
  const groupedByYear = months.reduce((acc: YearGroup, month) => {
    const year = month.key.split("-")[0];
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(month);
    return acc;
  }, {});

  // Ordenar anos (mais recente primeiro)
  const sortedYears = Object.keys(groupedByYear).sort(
    (a, b) => parseInt(b) - parseInt(a),
  );

  // Ordenar meses dentro de cada ano
  sortedYears.forEach((year) => {
    groupedByYear[year].sort((a, b) => a.key.localeCompare(b.key));
  });

  return { groupedByYear, sortedYears };
}

"use client";

import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";

interface AppointmentDatePresetsProps {
  setDate: (date: DateRange | undefined) => void;
}

export function AppointmentDatePresets({
  setDate,
}: AppointmentDatePresetsProps) {
  const presets = [
    {
      label: "Hoje",
      range: {
        from: startOfDay(new Date()), // ✅ 21/07/2025 00:00:00
        to: endOfDay(new Date()), // ✅ 21/07/2025 23:59:59
      },
    },
    {
      label: "Ontem",
      range: {
        from: startOfDay(addDays(new Date(), -1)), // ✅ 20/07/2025 00:00:00
        to: endOfDay(addDays(new Date(), -1)), // ✅ 20/07/2025 23:59:59
      },
    },
    {
      label: "Últimos 7 dias",
      range: {
        from: startOfDay(addDays(new Date(), -6)), // ✅ Início do dia há 6 dias
        to: endOfDay(new Date()), // ✅ Final do dia hoje
      },
    },
    {
      label: "Esta semana",
      range: {
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date()),
      },
    },
    {
      label: "Este mês",
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      },
    },
    {
      label: "Próximo mês",
      range: {
        from: startOfMonth(addMonths(new Date(), 1)), // Primeiro dia do próximo mês
        to: endOfMonth(addMonths(new Date(), 1)), // Último dia do próximo mês
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => setDate(preset.range)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

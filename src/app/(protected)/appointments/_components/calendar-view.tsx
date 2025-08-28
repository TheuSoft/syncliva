"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/appointments";

import { DayAppointmentsModal } from "./day-appointments-modal";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface CalendarViewProps {
  appointments: AppointmentWithRelations[];
  onAddAppointment?: (date?: Date) => void;
  onEditAppointment?: (appointment: AppointmentWithRelations) => void;
  onConfirmAppointment?: (appointment: AppointmentWithRelations) => void;
  onCancelAppointment?: (appointment: AppointmentWithRelations) => void;
  isDoctor?: boolean; // Indica se estamos na visualização do médico
}

export function CalendarView({
  appointments,
  onAddAppointment,
  onEditAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  isDoctor = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{
    date: Date;
    appointments: AppointmentWithRelations[];
  } | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Criar grid do calendário (começando na segunda-feira)
  const calendarDays = useMemo(() => {
    const start = new Date(monthStart);
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajustar para segunda-feira
    start.setDate(start.getDate() - diff);

    const end = new Date(monthEnd);
    const endDayOfWeek = end.getDay();
    const endDiff = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    end.setDate(end.getDate() + endDiff);

    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);

  // Agrupar agendamentos por data
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentWithRelations[]> = {};

    appointments.forEach((appointment) => {
      const dateKey = format(
        dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
        "yyyy-MM-dd",
      );
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });

    return grouped;
  }, [appointments]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "next") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Agendamentos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-xs"
              >
                Hoje
              </Button>
              {onAddAppointment && (
                <Button
                  size="sm"
                  onClick={() => onAddAppointment()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              )}
            </div>
          </div>

          {/* Navegação do mês */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="w-full max-w-full overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="mb-2 grid w-full max-w-full grid-cols-7 gap-1">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
              <div
                key={day}
                className="text-muted-foreground p-2 text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid min-h-0 grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "h-full min-h-[100px] w-full max-w-full cursor-pointer overflow-hidden rounded-lg border p-2 transition-colors",
                    isCurrentMonth
                      ? "bg-background hover:bg-muted/50"
                      : "bg-muted/30 text-muted-foreground",
                    isTodayDate && "ring-primary ring-2",
                    dayAppointments.length > 0 &&
                      "bg-blue-50 dark:bg-blue-950/20",
                  )}
                  onClick={() => {
                    if (dayAppointments.length > 0) {
                      setSelectedDay({
                        date: day,
                        appointments: dayAppointments,
                      });
                    }
                  }}
                >
                  <div className="mb-1 text-sm font-medium">
                    {format(day, "d")}
                  </div>

                  {/* Agendamentos do dia */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={cn(
                          "w-full max-w-full truncate overflow-hidden rounded-lg border p-1.5 text-xs shadow-sm",
                          appointment.status === "confirmed"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : appointment.status === "pending"
                              ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300",
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {dayjs(appointment.date)
                              .tz(BRAZIL_TIMEZONE)
                              .format("HH:mm")}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="truncate">
                            {appointment.patient.name}
                          </span>
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-muted-foreground bg-muted/50 rounded px-2 py-1 text-center text-xs">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal para mostrar agendamentos do dia */}
      <DayAppointmentsModal
        date={selectedDay?.date || new Date()}
        appointments={selectedDay?.appointments || []}
        isOpen={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        onEditAppointment={onEditAppointment}
        onConfirmAppointment={onConfirmAppointment}
        onCancelAppointment={onCancelAppointment}
        isDoctor={isDoctor}
      />
    </>
  );
}

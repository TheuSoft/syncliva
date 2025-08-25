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
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AppointmentWithRelations } from "@/types/appointments";

import { AppointmentCard } from "./appointment-card";
import { DayAppointmentsModal } from "./day-appointments-modal";

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
      const dateKey = format(appointment.date, "yyyy-MM-dd");
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
      <Card className="from-background via-background to-muted/20 border-0 bg-gradient-to-br shadow-lg">
        <CardHeader className="border-border/20 from-muted/5 to-muted/10 border-b bg-gradient-to-r">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-3 text-xl font-semibold">
              <div className="bg-primary/10 dark:bg-primary/20 border-primary/20 rounded-lg border p-2.5">
                <Calendar className="text-primary h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR }).replace(
                    /^\w/,
                    (c) => c.toUpperCase(),
                  )}
                </div>
                <div className="text-muted-foreground mt-0.5 text-sm font-normal">
                  Agenda de Consultas
                </div>
              </div>
            </CardTitle>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="bg-muted/50 hover:bg-muted border-border/40 h-auto border px-3 py-1.5 text-xs font-medium"
              >
                Hoje
              </Button>

              <div className="border-border/40 bg-muted/30 flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="hover:bg-background h-8 w-8 rounded-l-lg rounded-r-none border-0 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="bg-border/40 h-6 w-px"></div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="hover:bg-background h-8 w-8 rounded-l-none rounded-r-lg border-0 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Cabeçalho dos dias da semana */}
          <div className="bg-muted/20 border-border/20 mb-0 grid grid-cols-7 gap-px border-b">
            {[
              "Segunda",
              "Terça",
              "Quarta",
              "Quinta",
              "Sexta",
              "Sábado",
              "Domingo",
            ].map((day, index) => (
              <div
                key={day}
                className="text-muted-foreground bg-background p-3 text-center text-sm font-semibold"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][index]}
                </span>
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="bg-border/10 grid grid-cols-7 gap-0">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={index}
                  className={cn(
                    "bg-background border-border/10 hover:bg-muted/30 relative min-h-[100px] border-r border-b p-2 transition-colors sm:min-h-[120px] sm:p-3 md:min-h-[140px]",
                    !isCurrentMonth && "text-muted-foreground bg-muted/10",
                    isCurrentDay && "bg-primary/5 border-primary/20",
                  )}
                >
                  {/* Número do dia */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex items-center justify-center text-sm font-semibold",
                          isCurrentDay
                            ? "bg-primary text-primary-foreground h-7 w-7 rounded-full text-xs shadow-md"
                            : isCurrentMonth
                              ? "text-foreground"
                              : "text-muted-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {/* Indicador de agendamentos */}
                      {dayAppointments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full shadow-sm",
                              dayAppointments.some(
                                (a) => a.status === "confirmed",
                              )
                                ? "bg-emerald-500"
                                : dayAppointments.some(
                                      (a) => a.status === "pending",
                                    )
                                  ? "bg-amber-500"
                                  : "bg-slate-400",
                            )}
                          />
                          <span className="text-muted-foreground text-xs font-medium">
                            {dayAppointments.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botão para adicionar agendamento */}
                    {isCurrentMonth && onAddAppointment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:border-primary/20 h-6 w-6 border border-transparent p-0 opacity-0 transition-all duration-200 group-hover:opacity-100"
                        onClick={() => onAddAppointment(day)}
                      >
                        <Plus className="text-primary h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Agendamentos do dia */}
                  <div className="space-y-0.5 overflow-hidden sm:space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={onEditAppointment}
                        onConfirm={onConfirmAppointment}
                        onCancel={onCancelAppointment}
                        isDoctor={isDoctor}
                        className="from-background to-muted/20 border-border/40 hover:from-primary/5 hover:to-primary/10 hover:border-primary/30 rounded-md border bg-gradient-to-r px-2 py-1.5 text-xs shadow-sm transition-all duration-200 hover:shadow-md"
                      />
                    ))}

                    {/* Indicador de mais agendamentos */}
                    {dayAppointments.length > 3 && (
                      <button
                        className="text-primary from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-primary/30 hover:border-primary/50 hover:text-primary/90 w-full transform cursor-pointer rounded-md border border-dashed bg-gradient-to-r px-2 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                        onClick={() =>
                          setSelectedDay({
                            date: day,
                            appointments: dayAppointments,
                          })
                        }
                      >
                        +{dayAppointments.length - 3} mais agendamentos
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda de status */}
          <div className="border-border/30 from-muted/20 mt-6 flex flex-wrap items-center gap-3 rounded-lg border-t bg-gradient-to-r to-transparent px-4 py-3 pt-4">
            <span className="text-foreground text-sm font-semibold">
              Status dos Agendamentos:
            </span>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm"></div>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Confirmado
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm"></div>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Pendente
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-400 shadow-sm"></div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Cancelado
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para exibir todos os agendamentos do dia */}
      <DayAppointmentsModal
        isOpen={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        date={selectedDay?.date || new Date()}
        appointments={selectedDay?.appointments || []}
        isDoctor={isDoctor}
        onConfirmAppointment={(appointment) => {
          onConfirmAppointment?.(appointment);
          setSelectedDay(null);
        }}
        onCancelAppointment={(appointment) => {
          onCancelAppointment?.(appointment);
          setSelectedDay(null);
        }}
        onEditAppointment={(appointment) => {
          onEditAppointment?.(appointment);
          setSelectedDay(null);
        }}
      />
    </>
  );
}

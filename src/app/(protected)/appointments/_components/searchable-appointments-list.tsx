"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarDays, Filter, List, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/cancel-appointment";
import { confirmAppointment } from "@/actions/confirm-appointment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppointmentWithRelations } from "@/types/appointments";

import { AppointmentCard } from "./appointment-card";
import { CalendarView } from "./calendar-view";
import { EditAppointmentModal } from "./edit-appointment-modal";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface SearchableAppointmentsListProps {
  initialAppointments: AppointmentWithRelations[];
  patients: { id: string; name: string; email: string }[];
  doctors: {
    id: string;
    name: string;
    specialty: string;
    availableFromWeekDay: number;
    availableToWeekDay: number;
    appointmentPriceInCents: number;
  }[];
  isDoctor?: boolean; // Indica se estamos no dashboard do médico
}

const SearchableAppointmentsList = ({
  initialAppointments,
  patients,
  doctors,
  isDoctor = false,
}: SearchableAppointmentsListProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // ✅ Estados para modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<AppointmentWithRelations | null>(null);

  // Calcular meses disponíveis dos agendamentos agrupados por ano
  const availableMonthsByYear = useMemo(() => {
    const monthsMap = new Map<
      string,
      { key: string; label: string; year: string }
    >();

    initialAppointments.forEach((appointment) => {
      const appointmentDate = dayjs(appointment.date)
        .tz(BRAZIL_TIMEZONE)
        .toDate();
      const monthKey = format(appointmentDate, "yyyy-MM");
      const year = format(appointmentDate, "yyyy");
      // Formatar com primeira letra maiúscula
      let monthLabel = format(appointmentDate, "MMMM", { locale: ptBR });
      monthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      monthsMap.set(monthKey, { key: monthKey, label: monthLabel, year });
    });

    const months = Array.from(monthsMap.values());

    // Agrupar por ano
    const groupedByYear = months.reduce(
      (acc, month) => {
        if (!acc[month.year]) {
          acc[month.year] = [];
        }
        acc[month.year].push(month);
        return acc;
      },
      {} as Record<string, { key: string; label: string; year: string }[]>,
    );

    // Ordenar anos (mais recente primeiro) e meses dentro de cada ano
    const sortedYears = Object.keys(groupedByYear).sort((a, b) =>
      b.localeCompare(a),
    );

    sortedYears.forEach((year) => {
      groupedByYear[year].sort((a, b) => a.key.localeCompare(b.key));
    });

    return { groupedByYear, sortedYears };
  }, [initialAppointments]);

  const filteredAppointments = initialAppointments.filter((appointment) => {
    const matchesSearch = appointment.patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesMonth =
      selectedMonth === "all"
        ? true
        : format(
            dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
            "yyyy-MM",
          ) === selectedMonth;

    const matchesDoctor =
      selectedDoctor === "all" ? true : appointment.doctorId === selectedDoctor;

    return matchesSearch && matchesMonth && matchesDoctor;
  });

  const clearFilters = (): void => {
    setSearchTerm("");
    setSelectedMonth("all");
    setSelectedDoctor("all");
  };

  // ✅ Função para abrir modal de edição
  const handleEditAppointment = (
    appointment: AppointmentWithRelations,
  ): void => {
    setAppointmentToEdit(appointment);
    setEditModalOpen(true);
  };

  // Funções para ações dos agendamentos
  const handleConfirmAppointment = async (
    appointment: AppointmentWithRelations,
  ) => {
    try {
      const result = await confirmAppointment({
        appointmentId: appointment.id,
      });

      if (result.success) {
        toast.success(result.message);
        // Recarregar a página para atualizar os dados
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleCancelAppointment = async (
    appointment: AppointmentWithRelations,
  ) => {
    try {
      const result = await cancelAppointment({ appointmentId: appointment.id });

      if (result.success) {
        toast.success(result.message);
        // Recarregar a página para atualizar os dados
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao cancelar agendamento");
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 overflow-hidden">
      {/* Filtros - apenas na visualização de lista */}
      {view === "list" && (
        <div className="flex w-full max-w-full flex-col gap-4 overflow-hidden md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-full flex-col gap-2 overflow-hidden md:flex-row md:gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Filtrar por mês:</p>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {availableMonthsByYear.sortedYears.map((year) => (
                    <div key={year}>
                      <div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
                        {year}
                      </div>
                      {availableMonthsByYear.groupedByYear[year].map(
                        ({ key, label }) => (
                          <SelectItem key={key} value={key} className="pl-6">
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isDoctor && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Filtrar por médico:</p>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os médicos</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Buscar paciente:</p>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Digite o nome do paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Toggle de visualização */}
      <div className="flex w-full max-w-full items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Calendário
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Lista
          </Button>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          {filteredAppointments.length} de {initialAppointments.length}{" "}
          agendamentos
        </div>
      </div>

      {/* Conteúdo baseado na visualização */}
      {view === "calendar" ? (
        <CalendarView
          appointments={filteredAppointments}
          onEditAppointment={handleEditAppointment}
          onConfirmAppointment={handleConfirmAppointment}
          onCancelAppointment={handleCancelAppointment}
          isDoctor={isDoctor}
        />
      ) : (
        <div className="w-full max-w-full space-y-8 overflow-hidden">
          {(() => {
            // Agrupar agendamentos por mês
            const appointmentsByMonth = filteredAppointments.reduce(
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
                    label:
                      monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
                    appointments: [],
                  };
                }
                acc[monthKey].appointments.push(appointment);
                return acc;
              },
              {} as Record<
                string,
                { label: string; appointments: AppointmentWithRelations[] }
              >,
            );

            // Ordenar meses (mais recente primeiro)
            const sortedMonths = Object.entries(appointmentsByMonth).sort(
              ([a], [b]) => b.localeCompare(a),
            );

            return sortedMonths.map(([monthKey, { label, appointments }]) => (
              <div
                key={monthKey}
                className="w-full max-w-full space-y-4 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-border h-px flex-1" />
                  <h3 className="text-foreground text-lg font-semibold">
                    {label}
                  </h3>
                  <div className="bg-border h-px flex-1" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={handleEditAppointment}
                      onConfirm={handleConfirmAppointment}
                      onCancel={handleCancelAppointment}
                      isDoctor={isDoctor}
                    />
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Modal de edição */}
      <EditAppointmentModal
        appointment={appointmentToEdit}
        patients={patients}
        doctors={doctors}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};

export { SearchableAppointmentsList };

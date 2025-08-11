"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";

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

import { AppointmentsTimeline } from "./appointments-timeline";
import { EditAppointmentModal } from "./edit-appointment-modal";

// Tipos para pacientes e médicos
type Patient = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  sex: "male" | "female";
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  appointmentPriceInCents: number;
  availableFromWeekDay: number;
  availableToWeekDay: number;
};

interface SearchableAppointmentsListProps {
  initialAppointments: AppointmentWithRelations[];
  patients: Patient[];
  doctors: Doctor[];
  doctorId?: string; // Parâmetro opcional para filtrar agendamentos por médico
  isDoctor?: boolean; // Indica se estamos no dashboard do médico
}

const SearchableAppointmentsList = ({
  initialAppointments,
  patients,
  doctors,
  doctorId,
  isDoctor = false,
}: SearchableAppointmentsListProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");

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
      const appointmentDate = new Date(appointment.date);
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
      groupedByYear[year].sort((a, b) => b.key.localeCompare(a.key));
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
        : format(new Date(appointment.date), "yyyy-MM") === selectedMonth;

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

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
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

          {/* Seletor de médicos - somente para admin */}
          {!isDoctor && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Filtrar por médico:</p>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Selecione um médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os médicos</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <span className="font-medium text-blue-700 dark:text-blue-300">
                        {doctor.name} - {doctor.specialty}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Busca e botão limpar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          type="text"
          placeholder="Buscar por nome do paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {(searchTerm ||
          selectedMonth !== "all" ||
          selectedDoctor !== "all") && (
          <Button variant="outline" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Informações dos filtros */}
      <div className="text-muted-foreground text-sm">
        <p>
          Mostrando {filteredAppointments.length} de{" "}
          {initialAppointments.length} agendamentos
          {searchTerm && ` • Busca: "${searchTerm}"`}
          {selectedMonth !== "all" &&
            (() => {
              // Encontrar o mês selecionado em todos os anos
              for (const year of availableMonthsByYear.sortedYears) {
                const month = availableMonthsByYear.groupedByYear[year].find(
                  (m) => m.key === selectedMonth,
                );
                if (month) {
                  return ` • Mês: ${month.label} de ${month.year}`;
                }
              }
              return ` • Mês: ${selectedMonth}`;
            })()}
          {selectedDoctor !== "all" &&
            (() => {
              // Encontrar o médico selecionado
              const doctor = doctors.find((d) => d.id === selectedDoctor);
              if (doctor) {
                return ` • Médico: ${doctor.name}`;
              }
              return ` • Médico: ID ${selectedDoctor}`;
            })()}
        </p>
      </div>

      {/* Timeline de Agendamentos */}
      <AppointmentsTimeline
        appointments={filteredAppointments}
        onEdit={handleEditAppointment}
        doctorId={doctorId}
        isDoctor={isDoctor}
      />

      {/* Modal de Edição - não mostrar para médicos */}
      {!isDoctor && (
        <EditAppointmentModal
          appointment={appointmentToEdit}
          patients={patients}
          doctors={doctors}
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) {
              setAppointmentToEdit(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default SearchableAppointmentsList;

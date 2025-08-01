"use client";

import { isWithinInterval } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import type { AppointmentWithRelations } from "@/types/appointments";

import { AppointmentDatePresets } from "./appointment-date-presets";
import { DatePickerWithRange } from "./date-range-picker";
import { EditAppointmentModal } from "./edit-appointment-modal";
import { createAppointmentsTableColumns } from "./table-columns";

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
};

interface SearchableAppointmentsListProps {
  initialAppointments: AppointmentWithRelations[];
  patients: Patient[]; // ✅ Nova prop
  doctors: Doctor[]; // ✅ Nova prop
}

const getRowClassName = (appointment: AppointmentWithRelations): string => {
  switch (appointment.status) {
    case "confirmed":
      return "bg-green-50/50 border-l-4 border-green-400";
    case "canceled":
      return "bg-red-50/50 opacity-75 border-l-4 border-red-400";
    default:
      return "border-l-4 border-transparent";
  }
};

const SearchableAppointmentsList = ({
  initialAppointments,
  patients, // ✅ Nova prop
  doctors, // ✅ Nova prop
}: SearchableAppointmentsListProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // ✅ Estados para modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<AppointmentWithRelations | null>(null);

  const isDateInRange = (appointmentDate: Date, range: DateRange): boolean => {
    if (!range.from) return true;

    if (range.from && range.to) {
      return isWithinInterval(appointmentDate, {
        start: range.from,
        end: range.to,
      });
    }

    if (range.from && !range.to) {
      return appointmentDate.toDateString() === range.from.toDateString();
    }

    return true;
  };

  const filteredAppointments = initialAppointments.filter((appointment) => {
    const matchesSearch = appointment.patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesDate = dateRange
      ? isDateInRange(appointment.date, dateRange)
      : true;

    return matchesSearch && matchesDate;
  });

  const clearFilters = (): void => {
    setSearchTerm("");
    setDateRange(undefined);
  };

  // ✅ Função para abrir modal de edição
  const handleEditAppointment = (
    appointment: AppointmentWithRelations,
  ): void => {
    setAppointmentToEdit(appointment);
    setEditModalOpen(true);
  };

  // ✅ Criar colunas com callback de edição
  const columns = createAppointmentsTableColumns(handleEditAppointment);

  return (
    <div className="space-y-4">
      {/* Filtros de data */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Filtrar por período:</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-full md:w-auto"
            />
            <AppointmentDatePresets setDate={setDateRange} />
          </div>
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

        {(searchTerm || dateRange) && (
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
          {dateRange?.from &&
            ` • Período: ${dateRange.from.toLocaleDateString("pt-BR")}${
              dateRange.to
                ? ` até ${dateRange.to.toLocaleDateString("pt-BR")}`
                : ""
            }`}
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredAppointments}
        columns={columns}
        getRowClassName={getRowClassName}
      />

      {/* ✅ Modal de Edição */}
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
    </div>
  );
};

export default SearchableAppointmentsList;

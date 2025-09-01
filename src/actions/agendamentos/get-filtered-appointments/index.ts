"use server";

import { format } from "date-fns";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { AppointmentWithRelations } from "@/types/appointments";

dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

interface FilterCriteria {
  searchTerm?: string;
  selectedMonth?: string;
  selectedDoctor?: string;
  selectedStatus?: string;
}

interface GetFilteredAppointmentsParams {
  appointments: AppointmentWithRelations[];
  filters: FilterCriteria;
}

export async function getFilteredAppointments({
  appointments,
  filters,
}: GetFilteredAppointmentsParams): Promise<AppointmentWithRelations[]> {
  const {
    searchTerm = "",
    selectedMonth = "all",
    selectedDoctor = "all",
    selectedStatus = "all",
  } = filters;

  return appointments.filter((appointment) => {
    // Filtro por nome do paciente
    const matchesSearch = appointment.patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filtro por mês
    const matchesMonth =
      selectedMonth === "all"
        ? true
        : format(
            dayjs(appointment.date).tz(BRAZIL_TIMEZONE).toDate(),
            "yyyy-MM",
          ) === selectedMonth;

    // Filtro por médico
    const matchesDoctor =
      selectedDoctor === "all" ? true : appointment.doctorId === selectedDoctor;

    // Filtro por status
    const matchesStatus =
      selectedStatus === "all" ? true : appointment.status === selectedStatus;

    return matchesSearch && matchesMonth && matchesDoctor && matchesStatus;
  });
}

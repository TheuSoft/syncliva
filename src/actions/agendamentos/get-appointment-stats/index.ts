"use server";

import type { AppointmentWithRelations } from "@/types/appointments";

interface AppointmentStats {
  total: number;
  confirmed: number;
  pending: number;
  canceled: number;
}

interface GetAppointmentStatsParams {
  appointments: AppointmentWithRelations[];
}

export async function getAppointmentStats({
  appointments,
}: GetAppointmentStatsParams): Promise<AppointmentStats> {
  const stats: AppointmentStats = {
    total: appointments.length,
    confirmed: 0,
    pending: 0,
    canceled: 0,
  };

  appointments.forEach((appointment) => {
    const status = appointment.status;
    if (
      status === "confirmed" ||
      status === "pending" ||
      status === "canceled"
    ) {
      stats[status]++;
    }
  });

  return stats;
}

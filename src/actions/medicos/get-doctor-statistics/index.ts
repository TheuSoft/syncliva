import { eq } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";

export interface DoctorStatistics {
  totalDoctors: number;
  activeDoctors: number;
  invitedDoctors: number;
  pendingDoctors: number;
}

/**
 * Calcula estatísticas dos médicos de uma clínica
 * @param clinicId - ID da clínica
 * @returns Estatísticas dos médicos
 */
export async function getDoctorStatistics(
  clinicId: string,
): Promise<DoctorStatistics> {
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, clinicId),
  });

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(
    (doctor) => !!doctor.registeredAt,
  ).length;
  const invitedDoctors = doctors.filter(
    (doctor) => !!doctor.inviteToken && !doctor.registeredAt,
  ).length;
  const pendingDoctors = doctors.filter(
    (doctor) => !doctor.inviteToken && !doctor.registeredAt,
  ).length;

  return {
    totalDoctors,
    activeDoctors,
    invitedDoctors,
    pendingDoctors,
  };
}

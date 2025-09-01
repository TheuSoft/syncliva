import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

export async function getDoctorAppointments(doctorId: string) {
  try {
    // Buscar os agendamentos do médico com dados do paciente
    const appointments = await db
      .select({
        id: appointmentsTable.id,
        date: appointmentsTable.date,
        status: appointmentsTable.status,
        appointmentPriceInCents: appointmentsTable.appointmentPriceInCents,
        patient: {
          id: patientsTable.id,
          name: patientsTable.name,
          email: patientsTable.email,
          phoneNumber: patientsTable.phoneNumber,
          sex: patientsTable.sex,
        },
        doctor: {
          id: doctorsTable.id,
          name: doctorsTable.name,
          specialty: doctorsTable.specialty,
        },
      })
      .from(appointmentsTable)
      .innerJoin(
        patientsTable,
        eq(appointmentsTable.patientId, patientsTable.id),
      )
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(eq(appointmentsTable.doctorId, doctorId))
      .orderBy(appointmentsTable.date);

    return {
      success: true,
      appointments,
    };
  } catch (error) {
    console.error("Erro ao buscar agendamentos do médico:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      appointments: [],
    };
  }
}

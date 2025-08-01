import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getDoctorAppointments() {
  try {
    // Obter a sessão do médico
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (session.user.role !== "doctor") {
      throw new Error("Usuário não é um médico");
    }

    // Buscar o médico pelo userId
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (!user.length || !user[0].doctorId) {
      throw new Error("Médico não encontrado");
    }

    const doctorId = user[0].doctorId;

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
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
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

"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getReceptionistAppointments() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "receptionist") {
      throw new Error("Apenas recepcionistas podem acessar esta funcionalidade");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    const clinicId = session.user.clinic.id;

    const appointments = await db
      .select({
        id: appointmentsTable.id,
        patientName: patientsTable.name,
        patientPhone: patientsTable.phoneNumber,
        doctorName: doctorsTable.name,
        scheduledAt: appointmentsTable.date,
        status: appointmentsTable.status,

      })
      .from(appointmentsTable)
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(eq(appointmentsTable.clinicId, clinicId))
      .orderBy(appointmentsTable.date);

    return appointments;
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

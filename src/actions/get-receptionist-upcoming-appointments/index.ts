"use server";

import { and, eq, gte, lt, ne } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getReceptionistUpcomingAppointments() {
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

    // Buscar próximos agendamentos (próximos 7 dias)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingAppointments = await db
      .select({
        id: appointmentsTable.id,
        patientName: patientsTable.name,
        doctorName: doctorsTable.name,
        scheduledAt: appointmentsTable.date,
        status: appointmentsTable.status,
      })
      .from(appointmentsTable)
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, now),
          lt(appointmentsTable.date, sevenDaysFromNow),
          ne(appointmentsTable.status, "canceled")
        )
      )
             .orderBy(appointmentsTable.date)
      .limit(10);

    return upcomingAppointments;
  } catch (error) {
    console.error("Erro ao buscar próximos agendamentos:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

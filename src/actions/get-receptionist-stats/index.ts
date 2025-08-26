"use server";

import { and, eq, gte, lt,sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getReceptionistStats() {
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

    // Agendamentos de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, today),
          lt(appointmentsTable.date, tomorrow)
        )
      );

    // Total de pacientes
    const totalPatients = await db
      .select({ count: sql<number>`count(*)` })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId));

    // Agendamentos pendentes
    const pendingAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          eq(appointmentsTable.status, "pending")
        )
      );

    // Médicos ativos
    const activeDoctors = await db
      .select({ count: sql<number>`count(*)` })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinicId));

    return {
      todayAppointments: todayAppointments[0]?.count || 0,
      totalPatients: totalPatients[0]?.count || 0,
      pendingAppointments: pendingAppointments[0]?.count || 0,
      activeDoctors: activeDoctors[0]?.count || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do recepcionista:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

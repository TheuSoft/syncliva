"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getReceptionistActivities() {
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

    // Buscar atividades dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Agendamentos recentes
    const recentAppointments = await db
      .select({
        id: appointmentsTable.id,
        type: sql<string>`'appointment_created'`,
        patientName: patientsTable.name,
        createdAt: appointmentsTable.createdAt,
      })
      .from(appointmentsTable)
      .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, sevenDaysAgo)
        )
      )
      .orderBy(appointmentsTable.createdAt)
      .limit(10);

    // Pacientes recentes
    const recentPatients = await db
      .select({
        id: patientsTable.id,
        type: sql<string>`'patient_registered'`,
        patientName: patientsTable.name,
        createdAt: patientsTable.createdAt,
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, clinicId),
          gte(patientsTable.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(patientsTable.createdAt)
      .limit(10);

    // Combinar e ordenar por data
    const allActivities = [
      ...recentAppointments.map(apt => ({
        ...apt,
        type: "appointment_created" as const,
      })),
      ...recentPatients.map(pat => ({
        ...pat,
        type: "patient_registered" as const,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

    return allActivities;
  } catch (error) {
    console.error("Erro ao buscar atividades do recepcionista:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

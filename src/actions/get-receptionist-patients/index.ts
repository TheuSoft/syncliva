"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getReceptionistPatients() {
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

    const patients = await db
      .select({
        id: patientsTable.id,
        name: patientsTable.name,
        email: patientsTable.email,
        phone: patientsTable.phoneNumber,
        cpf: patientsTable.cpf,

        createdAt: patientsTable.createdAt,
        updatedAt: patientsTable.updatedAt,
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId))
      .orderBy(patientsTable.name);

    return patients;
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

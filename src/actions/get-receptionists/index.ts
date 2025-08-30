"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { receptionistsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getReceptionists() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.role !== "admin") {
      throw new Error("Apenas administradores podem acessar esta funcionalidade");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar todos os recepcionistas da clínica
    const receptionists = await db
      .select({
        id: receptionistsTable.id,
        name: receptionistsTable.name,
        email: receptionistsTable.email,
        inviteToken: receptionistsTable.inviteToken,
        invitedAt: receptionistsTable.invitedAt,
        registeredAt: receptionistsTable.registeredAt,
        createdAt: receptionistsTable.createdAt,
        updatedAt: receptionistsTable.updatedAt,
      })
      .from(receptionistsTable)
      .where(eq(receptionistsTable.clinicId, session.user.clinic.id))
      .orderBy(receptionistsTable.createdAt);

    return receptionists;
  } catch (error) {
    console.error("Erro ao buscar recepcionistas:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getAdmins() {
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

    // Buscar todos os usuários admin da clínica
    const admins = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .innerJoin(
        usersToClinicsTable,
        and(
          eq(usersTable.id, usersToClinicsTable.userId),
          eq(usersToClinicsTable.clinicId, session.user.clinic.id)
        )
      )
      .where(eq(usersTable.role, "admin"))
      .orderBy(usersTable.createdAt);

    return admins;
  } catch (error) {
    console.error("Erro ao buscar administradores:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

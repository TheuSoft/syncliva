"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { receptionistsTable, usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getUserDetails(userId: string) {
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

    // Primeiro, tentar buscar como usuário admin (na tabela usersTable)
    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        emailVerified: usersTable.emailVerified,
        image: usersTable.image,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        doctorId: usersTable.doctorId,
        receptionistId: usersTable.receptionistId,
      })
      .from(usersTable)
      .innerJoin(
        usersToClinicsTable,
        and(
          eq(usersTable.id, usersToClinicsTable.userId),
          eq(usersToClinicsTable.clinicId, session.user.clinic.id)
        )
      )
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user.length > 0) {
      const userData = user[0];

      // Se for um recepcionista, buscar informações adicionais
      if (userData.role === "receptionist" && userData.receptionistId) {
        const receptionistDetails = await db
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
          .where(eq(receptionistsTable.id, userData.receptionistId))
          .limit(1);

        return {
          ...userData,
          receptionistDetails: receptionistDetails[0] || null,
        };
      }

      return userData;
    }

    // Se não encontrou como usuário, tentar buscar como recepcionista direto
    // Tentar buscar por ID primeiro, depois por inviteToken se não encontrar
    let receptionist = await db
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
      .where(
        and(
          eq(receptionistsTable.id, userId as string),
          eq(receptionistsTable.clinicId, session.user.clinic.id)
        )
      )
      .limit(1);

    // Se não encontrou como recepcionista por ID, tentar buscar por inviteToken
    if (receptionist.length === 0) {
      receptionist = await db
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
        .where(
          and(
            eq(receptionistsTable.inviteToken, userId),
            eq(receptionistsTable.clinicId, session.user.clinic.id)
          )
        )
        .limit(1);
    }

    if (receptionist && receptionist.length > 0) {
      const receptionistData = receptionist[0];
      
      // Buscar informações do usuário se existir
      const userData = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          emailVerified: usersTable.emailVerified,
          image: usersTable.image,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          doctorId: usersTable.doctorId,
          receptionistId: usersTable.receptionistId,
        })
        .from(usersTable)
        .where(receptionistData.email ? eq(usersTable.email, receptionistData.email) : undefined)
        .limit(1);

      return {
        ...(userData[0] || {
          id: receptionistData.id,
          name: receptionistData.name,
          email: receptionistData.email,
          role: "receptionist" as const,
          emailVerified: false,
          image: null,
          createdAt: receptionistData.createdAt,
          updatedAt: receptionistData.updatedAt,
          doctorId: null,
          receptionistId: receptionistData.id,
        }),
        receptionistDetails: receptionistData,
      };
    }

    throw new Error("Usuário não encontrado");
  } catch (error) {
    console.error("Erro ao buscar detalhes do usuário:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { receptionistsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateUserSchema } from "./schema";

export const updateUser = actionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      if (session.user.role !== "admin") {
        throw new Error("Apenas administradores podem atualizar usuários");
      }

      if (!session?.user.clinic?.id) {
        throw new Error("Clínica não encontrada");
      }

      const { userId, name, email, role } = parsedInput;

      // Primeiro, tentar buscar o usuário na tabela usersTable
      let currentUser = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          receptionistId: usersTable.receptionistId,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      // Se não encontrou na usersTable, pode ser um ID de recepcionista
      if (currentUser.length === 0) {
        // Buscar o recepcionista na tabela receptionistsTable
        const receptionist = await db
          .select({
            id: receptionistsTable.id,
            name: receptionistsTable.name,
            email: receptionistsTable.email,
          })
          .from(receptionistsTable)
          .where(eq(receptionistsTable.id, userId))
          .limit(1);

        if (receptionist.length === 0) {
          return {
            success: false,
            error: "Usuário não encontrado",
          };
        }

        // Buscar o usuário correspondente na usersTable pelo receptionistId
        currentUser = await db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role,
            receptionistId: usersTable.receptionistId,
          })
          .from(usersTable)
          .where(eq(usersTable.receptionistId, userId))
          .limit(1);

        if (currentUser.length === 0) {
          return {
            success: false,
            error: "Usuário não encontrado na tabela de usuários",
          };
        }
      }

      const user = currentUser[0];

      // Verificar se o email foi alterado
      const emailChanged = user.email !== email;

      // Só validar email único se o email foi alterado
      if (emailChanged) {
        // Verificar se o email já está em uso por outro usuário
        const existingUser = await db
          .select({ id: usersTable.id, name: usersTable.name })
          .from(usersTable)
          .where(and(eq(usersTable.email, email), ne(usersTable.id, user.id)))
          .limit(1);

        if (existingUser.length > 0) {
          return {
            success: false,
            error: `Este email já está sendo usado por outro usuário: ${existingUser[0].name}`,
          };
        }
      }

      // Atualizar dados do usuário
      await db
        .update(usersTable)
        .set({
          name,
          email,
          role,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      // Se for um recepcionista, atualizar também na tabela de recepcionistas
      if (user.role === "receptionist" && user.receptionistId) {
        await db
          .update(receptionistsTable)
          .set({
            name,
            email,
            updatedAt: new Date(),
          })
          .where(eq(receptionistsTable.id, user.receptionistId));
      }

      // Se o usuário se tornou recepcionista, buscar ou criar na tabela de recepcionistas
      if (role === "receptionist" && user.role !== "receptionist") {
        // Buscar se já existe um recepcionista com este email
        const existingReceptionist = await db
          .select({ id: receptionistsTable.id })
          .from(receptionistsTable)
          .where(eq(receptionistsTable.email, email))
          .limit(1);

        if (existingReceptionist.length > 0) {
          // Atualizar o usuário com o ID do recepcionista existente
          await db
            .update(usersTable)
            .set({
              receptionistId: existingReceptionist[0].id,
            })
            .where(eq(usersTable.id, user.id));
        }
      }

      revalidatePath("/users");

      return {
        success: true,
        message: "Usuário atualizado com sucesso!",
      };

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

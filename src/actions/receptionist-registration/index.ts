"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { receptionistsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { registerReceptionistSchema, validateReceptionistInviteSchema } from "./schema";

export const validateReceptionistInvite = actionClient
  .schema(validateReceptionistInviteSchema)
  .action(async ({ parsedInput: { token } }) => {
    try {
      const receptionist = await db
        .select()
        .from(receptionistsTable)
        .where(
          and(
            eq(receptionistsTable.inviteToken, token),
            // Verificar se o token não expirou
          )
        )
        .limit(1);

      if (!receptionist.length) {
        throw new Error("Token inválido ou expirado");
      }

      const receptionistData = receptionist[0];

      // Verificar se o token expirou
      if (receptionistData.inviteTokenExpiresAt && new Date() > receptionistData.inviteTokenExpiresAt) {
        throw new Error("Token expirado. Solicite um novo convite.");
      }

      // Verificar se já foi registrado
      if (receptionistData.registeredAt) {
        throw new Error("Este convite já foi utilizado");
      }

      return {
        success: true,
        receptionist: {
          id: receptionistData.id,
          name: receptionistData.name,
          email: receptionistData.email,
        },
      };
    } catch (error) {
      console.error("Erro ao validar convite:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

export const registerReceptionist = actionClient
  .schema(registerReceptionistSchema)
  .action(async ({ parsedInput: { token, name, email, password } }) => {
    try {
      const receptionist = await db
        .select()
        .from(receptionistsTable)
        .where(
          and(
            eq(receptionistsTable.inviteToken, token),
            // Verificar se o token não expirou
          )
        )
        .limit(1);

      if (!receptionist.length) {
        throw new Error("Token inválido ou expirado");
      }

      const receptionistData = receptionist[0];

      // Verificar se o token expirou
      if (receptionistData.inviteTokenExpiresAt && new Date() > receptionistData.inviteTokenExpiresAt) {
        throw new Error("Token expirado. Solicite um novo convite.");
      }

      if (receptionistData.registeredAt) {
        throw new Error("Este convite já foi utilizado");
      }

      // Criar usuário usando better-auth
      const authResult = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });

      if (!authResult) {
        throw new Error("Erro ao criar conta");
      }

      // Atualizar o recepcionista com informações de registro
      await db
        .update(receptionistsTable)
        .set({
          registeredAt: new Date(),
          inviteToken: null, // Limpar o token após uso
          inviteTokenExpiresAt: null,
        })
        .where(eq(receptionistsTable.id, receptionistData.id));

      // Atualizar o usuário criado para definir como recepcionista
      await db
        .update(usersTable)
        .set({
          role: "receptionist",
          receptionistId: receptionistData.id,
        })
        .where(eq(usersTable.email, email));

      // ✅ NOVO: Criar relação entre usuário e clínica do recepcionista
      const { usersToClinicsTable } = await import("@/db/schema");
      
      // Buscar o usuário recém-criado
      const user = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (user.length > 0) {
        await db.insert(usersToClinicsTable).values({
          userId: user[0].id,
          clinicId: receptionistData.clinicId,
        });
      }

      revalidatePath("/receptionists");

      return {
        success: true,
        message: "Registro realizado com sucesso! Você já pode fazer login.",
      };
    } catch (error) {
      console.error("Erro ao registrar recepcionista:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

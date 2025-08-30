"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { receptionistsTable, usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createUserSchema } from "./schema";

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Verificar sessão do usuário
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      
      // ✅ Apenas admins podem criar usuários
      if (session.user.role !== "admin") {
        throw new Error("Apenas administradores podem criar usuários");
      }
      
      if (!session?.user.clinic?.id) {
        throw new Error("Clínica não encontrada");
      }

      // Verificar se o email já está em uso
      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, parsedInput.email),
      });

      if (existingUser) {
        return {
          success: false,
          error: "Este email já está sendo usado por outro usuário",
        };
      }

      if (parsedInput.role === "admin") {
        // Criar novo administrador
        const authResult = await auth.api.signUpEmail({
          body: {
            name: parsedInput.name,
            email: parsedInput.email,
            password: "temp123456", // Senha temporária que será alterada no primeiro login
          },
        });

        if (!authResult) {
          throw new Error("Erro ao criar conta de usuário");
        }

        // Definir role como admin
        await db
          .update(usersTable)
          .set({ role: "admin" })
          .where(eq(usersTable.id, authResult.user!.id));

        // Associar à clínica
        await db.insert(usersToClinicsTable).values({
          userId: authResult.user!.id,
          clinicId: session.user.clinic.id,
        });

        revalidatePath("/users");

        return {
          success: true,
          message: "Administrador criado com sucesso! Uma senha temporária foi definida.",
        };

      } else if (parsedInput.role === "receptionist") {
        // Criar recepcionista (similar ao sistema de médicos)
        const [receptionist] = await db
          .insert(receptionistsTable)
          .values({
            clinicId: session.user.clinic.id,
            name: parsedInput.name,
            email: parsedInput.email,
          })
          .returning();

        revalidatePath("/users");

        return {
          success: true,
          message: "Recepcionista criado com sucesso! Use o botão 'Convidar' para enviar o convite.",
          receptionistId: receptionist.id,
        };
      }

      throw new Error("Tipo de usuário inválido");

    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

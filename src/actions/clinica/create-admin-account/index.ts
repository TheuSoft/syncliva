"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable, usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createAdminAccountSchema } from "./schema";

export const createAdminAccount = actionClient
  .schema(createAdminAccountSchema)
  .action(async ({ parsedInput }) => {
    console.log("🚀 Criando conta de administrador...");
    
    try {
      // 1. Criar usuário usando better-auth
      const authResult = await auth.api.signUpEmail({
        body: {
          name: parsedInput.name,
          email: parsedInput.email,
          password: parsedInput.password,
        },
      });

      if (!authResult) {
        throw new Error("Erro ao criar conta de usuário");
      }

      console.log("✅ Usuário criado:", authResult.user?.email);

      // 1.1. Garantir que o role seja 'clinic_admin'
      await db
        .update(usersTable)
        .set({ role: "clinic_admin" })
        .where(eq(usersTable.id, authResult.user!.id));

      console.log("✅ Role de administrador definido");

      // 2. Criar clínica
      const [clinic] = await db
        .insert(clinicsTable)
        .values({
          name: parsedInput.clinicName,
        })
        .returning();

      console.log("✅ Clínica criada:", clinic.name);

      // 3. Associar usuário à clínica
      await db.insert(usersToClinicsTable).values({
        userId: authResult.user!.id,
        clinicId: clinic.id,
      });

      console.log("✅ Usuário associado à clínica");

      return {
        success: true,
        clinic: {
          id: clinic.id,
          name: clinic.name,
        },
        user: {
          id: authResult.user!.id,
          email: authResult.user!.email,
        },
      };

    } catch (error) {
      console.error("❌ Erro ao criar conta:", error);
      throw new Error(error instanceof Error ? error.message : "Erro ao criar conta");
    }
  });

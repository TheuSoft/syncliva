"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { receptionistsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { updateReceptionistProfileSchema } from "./schema";

export const updateReceptionistProfile = actionClient
  .schema(updateReceptionistProfileSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      if (session.user.role !== "receptionist") {
        throw new Error("Apenas recepcionistas podem atualizar este perfil");
      }

      if (!session.user.receptionistId) {
        throw new Error("ID do recepcionista não encontrado");
      }

      // Atualizar dados do recepcionista
      await db
        .update(receptionistsTable)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          updatedAt: new Date(),
        })
        .where(eq(receptionistsTable.id, session.user.receptionistId));

      // Atualizar dados do usuário
      await db
        .update(usersTable)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, session.user.id));

      revalidatePath("/receptionist/profile");

      return {
        success: true,
        message: "Perfil atualizado com sucesso!",
      };

    } catch (error) {
      console.error("Erro ao atualizar perfil do recepcionista:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

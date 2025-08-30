"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { receptionistsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { inviteReceptionistSchema } from "./schema";

export const inviteReceptionist = actionClient
  .schema(inviteReceptionistSchema)
  .action(async ({ parsedInput: { receptionistId, email } }) => {
    try {
      // Verificar sessão do usuário
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      
      // ✅ NOVO: Apenas admins podem convidar recepcionistas
      if (session.user.role !== "admin") {
        throw new Error("Apenas administradores podem convidar recepcionistas");
      }
      
      if (!session?.user.clinic?.id) {
        throw new Error("Clínica não encontrada");
      }

      // Verificar se já existe outro recepcionista com este email
      const existingReceptionistWithEmail = await db
        .select({
          id: receptionistsTable.id,
          name: receptionistsTable.name,
        })
        .from(receptionistsTable)
        .where(eq(receptionistsTable.email, email))
        .limit(1);

      if (existingReceptionistWithEmail.length > 0 && existingReceptionistWithEmail[0].id !== receptionistId) {
        return {
          success: false,
          error: `Este email já está sendo usado por outro recepcionista: ${existingReceptionistWithEmail[0].name}`,
        };
      }

      // Buscar informações do recepcionista primeiro
      const receptionistInfo = await db
        .select({
          name: receptionistsTable.name,
          email: receptionistsTable.email,
          inviteToken: receptionistsTable.inviteToken,
          registeredAt: receptionistsTable.registeredAt,
          clinicId: receptionistsTable.clinicId,
        })
        .from(receptionistsTable)
        .where(eq(receptionistsTable.id, receptionistId))
        .limit(1);

      if (!receptionistInfo.length) {
        return {
          success: false,
          error: "Recepcionista não encontrado",
        };
      }

      const receptionist = receptionistInfo[0];

      // Verificar se o recepcionista pertence à clínica do usuário
      if (receptionist.clinicId !== session.user.clinic.id) {
        return {
          success: false,
          error: "Recepcionista não pertence à sua clínica",
        };
      }

      // Verificar se já foi registrado
      if (receptionist.registeredAt) {
        return {
          success: false,
          error: "Este recepcionista já foi registrado no sistema",
        };
      }

      // Verificar se já tem convite ativo
      if (receptionist.inviteToken) {
        return {
          success: false,
          error: "Este recepcionista já possui um convite ativo. Use 'Reenviar' para gerar um novo token.",
        };
      }

      // Gerar token único para o convite
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Atualizar o recepcionista com as informações do convite
      await db
        .update(receptionistsTable)
        .set({
          email,
          inviteToken,
          inviteTokenExpiresAt,
          invitedAt: new Date(),
        })
        .where(eq(receptionistsTable.id, receptionistId));

      // Gerar link de convite
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteLink = `${baseUrl}/auth/receptionist-register?token=${inviteToken}`;

      revalidatePath("/receptionists");

      const result = {
        success: true,
        message: "Convite gerado com sucesso!",
        inviteLink,
        receptionistName: receptionist.name,
        receptionistEmail: email,
      };
      
      console.log("🎯 Invite Receptionist Action Result:", result);
      return result;
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { updateInviteEmailSchema } from "./schema";

export const updateInviteEmail = actionClient
  .schema(updateInviteEmailSchema)
  .action(async ({ parsedInput: { doctorId, newEmail } }) => {
    try {
      // Verificar se já existe outro médico com este email
      const existingDoctorWithEmail = await db
        .select({
          id: doctorsTable.id,
          name: doctorsTable.name,
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.email, newEmail))
        .limit(1);

      if (existingDoctorWithEmail.length > 0 && existingDoctorWithEmail[0].id !== doctorId) {
        return {
          success: false,
          error: `Este email já está sendo usado por outro médico: ${existingDoctorWithEmail[0].name}`,
        };
      }

      // Buscar informações do médico
      const doctorInfo = await db
        .select({
          name: doctorsTable.name,
          email: doctorsTable.email,
          inviteToken: doctorsTable.inviteToken,
          registeredAt: doctorsTable.registeredAt,
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.id, doctorId))
        .limit(1);

      if (!doctorInfo.length) {
        return {
          success: false,
          error: "Médico não encontrado",
        };
      }

      const doctor = doctorInfo[0];

      // Verificar se já foi registrado
      if (doctor.registeredAt) {
        return {
          success: false,
          error: "Este médico já foi registrado no sistema. Não é possível alterar o email.",
        };
      }

      // Verificar se tem convite ativo
      if (!doctor.inviteToken) {
        return {
          success: false,
          error: "Este médico não possui convite ativo para ser alterado.",
        };
      }

      // Gerar novo token de segurança (por segurança)
      const newInviteToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Atualizar com novo email e token
      await db
        .update(doctorsTable)
        .set({
          email: newEmail,
          inviteToken: newInviteToken,
          inviteTokenExpiresAt,
          invitedAt: new Date(), // Atualizar data do convite
        })
        .where(eq(doctorsTable.id, doctorId));

      // Gerar novo link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteLink = `${baseUrl}/auth/doctor-register?token=${newInviteToken}`;

      // Não enviar email automaticamente - apenas retornar o link
      // const emailSent = await sendDoctorInviteEmail({
      //   to: newEmail,
      //   doctorName: doctor.name,
      //   inviteLink,
      //   clinicName: "Sistema de Gestão Médica",
      //   expiresIn: "7 dias",
      // });

      revalidatePath("/doctors");

      return {
        success: true,
        message: `Email de convite alterado com sucesso!`,
        oldEmail: doctor.email,
        newEmail,
        inviteLink,
        doctorName: doctor.name,
        doctorEmail: newEmail,
      };
    } catch (error) {
      console.error("Erro ao alterar email do convite:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

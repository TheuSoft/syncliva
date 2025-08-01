"use server";

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { inviteDoctorSchema } from "./schema";

export const inviteDoctor = actionClient
  .schema(inviteDoctorSchema)
  .action(async ({ parsedInput: { doctorId, email } }) => {
    try {
      // Verificar sessão do usuário
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      
      if (!session?.user.clinic?.id) {
        throw new Error("Clínica não encontrada");
      }

      // Verificar se já existe outro médico com este email
      const existingDoctorWithEmail = await db
        .select({
          id: doctorsTable.id,
          name: doctorsTable.name,
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.email, email))
        .limit(1);

      if (existingDoctorWithEmail.length > 0 && existingDoctorWithEmail[0].id !== doctorId) {
        return {
          success: false,
          error: `Este email já está sendo usado por outro médico: ${existingDoctorWithEmail[0].name}`,
        };
      }

      // Buscar informações do médico primeiro
      const doctorInfo = await db
        .select({
          name: doctorsTable.name,
          email: doctorsTable.email,
          inviteToken: doctorsTable.inviteToken,
          registeredAt: doctorsTable.registeredAt,
          clinicId: doctorsTable.clinicId,
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

      // Verificar se o médico pertence à clínica do usuário
      if (doctor.clinicId !== session.user.clinic.id) {
        return {
          success: false,
          error: "Médico não pertence à sua clínica",
        };
      }

      // Verificar se já foi registrado
      if (doctor.registeredAt) {
        return {
          success: false,
          error: "Este médico já foi registrado no sistema",
        };
      }

      // Verificar se já tem convite ativo
      if (doctor.inviteToken) {
        return {
          success: false,
          error: "Este médico já possui um convite ativo. Use 'Reenviar' para gerar um novo token.",
        };
      }

      // Gerar token único para o convite
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Atualizar o médico com as informações do convite
      await db
        .update(doctorsTable)
        .set({
          email,
          inviteToken,
          inviteTokenExpiresAt,
          invitedAt: new Date(),
        })
        .where(eq(doctorsTable.id, doctorId));

      // Gerar link de convite
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteLink = `${baseUrl}/auth/doctor-register?token=${inviteToken}`;

      // Não enviar email automaticamente - apenas retornar o link
      // const emailSent = await sendDoctorInviteEmail({
      //   to: email,
      //   doctorName: doctor.name,
      //   inviteLink,
      //   clinicName: "Sistema de Gestão Médica",
      //   expiresIn: "7 dias",
      // });

      revalidatePath("/doctors");

      const result = {
        success: true,
        message: "Convite gerado com sucesso!",
        inviteLink,
        doctorName: doctor.name,
        doctorEmail: email,
      };
      
      console.log("🎯 Invite Doctor Action Result:", result);
      return result;
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

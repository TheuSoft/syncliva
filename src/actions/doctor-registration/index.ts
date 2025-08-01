"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { registerDoctorSchema,validateInviteSchema } from "./schema";

export const validateInvite = actionClient
  .schema(validateInviteSchema)
  .action(async ({ parsedInput: { token } }) => {
    try {
      const doctor = await db
        .select()
        .from(doctorsTable)
        .where(
          and(
            eq(doctorsTable.inviteToken, token),
            // Verificar se o token não expirou
          )
        )
        .limit(1);

      if (!doctor.length) {
        throw new Error("Token inválido ou expirado");
      }

      const doctorData = doctor[0];

      // Verificar se o token expirou
      if (doctorData.inviteTokenExpiresAt && new Date() > doctorData.inviteTokenExpiresAt) {
        throw new Error("Token expirado. Solicite um novo convite.");
      }

      // Verificar se já foi registrado
      if (doctorData.registeredAt) {
        throw new Error("Este convite já foi utilizado");
      }

      return {
        success: true,
        doctor: {
          id: doctorData.id,
          name: doctorData.name,
          email: doctorData.email,
          specialty: doctorData.specialty,
        },
      };
    } catch (error) {
      console.error("Erro ao validar convite:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

export const registerDoctor = actionClient
  .schema(registerDoctorSchema)
  .action(async ({ parsedInput: { token, name, email, password } }) => {
    try {
      const doctor = await db
        .select()
        .from(doctorsTable)
        .where(
          and(
            eq(doctorsTable.inviteToken, token),
            // Verificar se o token não expirou
          )
        )
        .limit(1);

      if (!doctor.length) {
        throw new Error("Token inválido ou expirado");
      }

      const doctorData = doctor[0];

      // Verificar se o token expirou
      if (doctorData.inviteTokenExpiresAt && new Date() > doctorData.inviteTokenExpiresAt) {
        throw new Error("Token expirado. Solicite um novo convite.");
      }

      if (doctorData.registeredAt) {
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

      // Atualizar o médico com informações de registro
      await db
        .update(doctorsTable)
        .set({
          registeredAt: new Date(),
          inviteToken: null, // Limpar o token após uso
          inviteTokenExpiresAt: null,
        })
        .where(eq(doctorsTable.id, doctorData.id));

      // Atualizar o usuário criado para definir como médico
      await db
        .update(usersTable)
        .set({
          role: "doctor",
          doctorId: doctorData.id,
        })
        .where(eq(usersTable.email, email));

      // ✅ NOVO: Criar relação entre usuário e clínica do médico
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
          clinicId: doctorData.clinicId,
        });
      }

      revalidatePath("/doctors");

      return {
        success: true,
        message: "Registro realizado com sucesso! Você já pode fazer login.",
      };
    } catch (error) {
      console.error("Erro ao registrar médico:", error);
      throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
    }
  });

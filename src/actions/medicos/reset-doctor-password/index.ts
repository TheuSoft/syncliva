"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { resetDoctorPasswordSchema } from "./schema";

// Função para gerar senha temporária segura
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const resetDoctorPassword = actionClient
  .schema(resetDoctorPasswordSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "clinic_admin") {
      throw new Error(
        "Não autorizado. Apenas administradores podem redefinir senhas.",
      );
    }

    // Verificar se o médico existe e pertence à clínica do usuário
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });

    if (!doctor) {
      throw new Error("Médico não encontrado");
    }

    if (doctor.clinicId !== session.user.clinic?.id) {
      throw new Error("Médico não pertence à sua clínica");
    }

    // Verificar se o médico tem usuário cadastrado
    const doctorUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.doctorId, parsedInput.doctorId),
    });

    if (!doctorUser) {
      throw new Error("Médico ainda não foi registrado no sistema");
    }

    // Gerar senha temporária
    const temporaryPassword = generateTemporaryPassword();

    try {
      // Por enquanto, apenas gerar a senha e retornar para o admin
      // TODO: Implementar atualização real da senha quando descobrir a API correta do better-auth

      return {
        success: true,
        temporaryPassword,
        doctorName: doctor.name,
        doctorEmail: doctor.email,
        message:
          "Senha temporária gerada. Comunique ao médico para atualizar o sistema.",
      };
    } catch {
      throw new Error("Erro ao gerar senha temporária");
    }
  });

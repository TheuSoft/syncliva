"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { clinicsTable, usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { type UpdateClinicInfoSchema, updateClinicInfoSchema } from "./schema";

const handler = async ({
  parsedInput: data,
}: {
  parsedInput: UpdateClinicInfoSchema;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Busca a clínica do usuário através da tabela de relacionamento
  const [userClinic] = await db
    .select({
      clinicId: usersToClinicsTable.clinicId,
    })
    .from(usersToClinicsTable)
    .where(eq(usersToClinicsTable.userId, session.user.id))
    .limit(1);

  if (!userClinic) {
    throw new Error("Clínica não encontrada");
  }

  // Atualiza o nome da clínica se fornecido
  if (data.name) {
    await db
      .update(clinicsTable)
      .set({
        name: data.name,
      })
      .where(eq(clinicsTable.id, userClinic.clinicId));
  }

  // Atualiza o email do administrador se fornecido
  if (data.adminEmail) {
    await db
      .update(usersTable)
      .set({
        email: data.adminEmail,
      })
      .where(eq(usersTable.id, session.user.id));
  }

  return { success: true };
};

export const updateClinicInfo = actionClient
  .schema(updateClinicInfoSchema)
  .action(handler);

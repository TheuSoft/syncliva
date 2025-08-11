"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Se estamos criando um novo paciente, verificamos se o CPF já existe para esta clínica
    if (!parsedInput.id) {
      const existingPatient = await db.query.patientsTable.findFirst({
        where: and(
          eq(patientsTable.cpf, parsedInput.cpf),
          eq(patientsTable.clinicId, session.user.clinic.id)
        ),
      });

      if (existingPatient) {
        return {
          error: "Já existe um paciente cadastrado com este CPF nesta clínica."
        };
      }
    }

    await db
      .insert(patientsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
        },
      });

    revalidatePath("/patients");
    
    return {
      success: true
    };
  });

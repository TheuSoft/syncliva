"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getDoctorPrice(doctorId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    const doctor = await db
      .select({
        appointmentPriceInCents: doctorsTable.appointmentPriceInCents,
      })
      .from(doctorsTable)
      .where(
        eq(doctorsTable.id, doctorId)
      )
      .limit(1);

    if (!doctor || doctor.length === 0) {
      throw new Error("Médico não encontrado");
    }

    return doctor[0].appointmentPriceInCents;
  } catch (error) {
    console.error("Erro ao buscar preço do médico:", error);
    throw new Error(error instanceof Error ? error.message : "Erro interno do servidor");
  }
}

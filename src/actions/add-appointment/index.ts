"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { addAppointmentSchema } from "./schema";

export const addAppointment = actionClient
  .schema(addAppointmentSchema)
  .action(async ({ parsedInput }) => {
    console.log(
      "🔥🔥🔥 ACTION EXECUTED - INPUT:",
      JSON.stringify(parsedInput, null, 2),
    );

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("🔥🔥🔥 SESSION:", JSON.stringify(session, null, 2));

    if (!session?.user?.role || session.user.role !== "clinic_admin") {
      throw new Error("Usuário não autorizado para criar agendamentos");
    }

    if (!session.user.clinic?.id) {
      throw new Error("Clínica não encontrada na sessão");
    }

    // ✅ CORREÇÃO: Criar data/hora em horário local brasileiro sem conversões UTC
    const [hours, minutes] = parsedInput.time.split(":").map(Number);

    // Criar objeto Date diretamente em horário local
    const appointmentDate = new Date(parsedInput.date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    console.log("🔥 Original date:", parsedInput.date);
    console.log("🔥 Original time:", parsedInput.time);
    console.log("🔥 Final appointment date (local):", appointmentDate);
    console.log(
      "🔥 Final appointment date (ISO):",
      appointmentDate.toISOString(),
    );

    // Create appointment
    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      clinicId: session.user.clinic.id,
      date: appointmentDate, // ✅ Usando Date em horário local
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      status: "pending",
    });

    console.log("🔥🔥🔥 APPOINTMENT CREATED SUCCESSFULLY");

    revalidatePath("/appointments");

    return { success: true };
  });

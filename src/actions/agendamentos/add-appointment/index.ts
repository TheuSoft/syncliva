"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { addAppointmentSchema } from "./schema";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

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

    // Criar data/hora usando dayjs (mesma lógica do appointment card)
    // ✅ CORREÇÃO: Criar data/hora no timezone brasileiro e converter para UTC
    const dateStr = dayjs(parsedInput.date).format("YYYY-MM-DD");
    const dateTimeStr = `${dateStr} ${parsedInput.time}`;

    console.log("🔥 Original date:", parsedInput.date);
    console.log("🔥 Original time:", parsedInput.time);
    console.log("🔥 Date string:", dateStr);
    console.log("🔥 DateTime string:", dateTimeStr);

    // Criar data/hora no timezone brasileiro
    const brazilDateTime = dayjs.tz(
      dateTimeStr,
      "YYYY-MM-DD HH:mm",
      BRAZIL_TIMEZONE,
    );

    // Converter para UTC para salvar no banco (padrão internacional)
    const appointmentDate = brazilDateTime.utc().toDate();

    console.log("🔥 Brazil date time:", brazilDateTime.format());
    console.log("🔥 UTC date time for DB:", appointmentDate.toISOString());
    console.log(
      "🔥 Verificação - UTC convertido de volta para Brasil:",
      dayjs(appointmentDate).tz(BRAZIL_TIMEZONE).format("HH:mm"),
    );

    // Create appointment
    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      clinicId: session.user.clinic.id,
      date: appointmentDate,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      status: "pending",
    });

    console.log("🔥🔥🔥 APPOINTMENT CREATED SUCCESSFULLY");

    revalidatePath("/appointments");

    return { success: true };
  });

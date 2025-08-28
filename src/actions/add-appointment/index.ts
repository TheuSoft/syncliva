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

dayjs.extend(utc);
dayjs.extend(timezone);

// Configurar timezone padrão para Brasil
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

    // Criar data/hora em horário local brasileiro e converter para UTC
    const [hours, minutes] = parsedInput.time.split(":").map(Number);

    // Criar data local brasileira
    const localDateTime = dayjs(parsedInput.date)
      .tz(BRAZIL_TIMEZONE)
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);

    // Converter para UTC para salvar no banco
    const appointmentDate = localDateTime.utc().toDate();

    console.log("🔥 Original date:", parsedInput.date);
    console.log("🔥 Original time:", parsedInput.time);
    console.log(
      "🔥 Local date time:",
      localDateTime.format("YYYY-MM-DD HH:mm:ss"),
    );
    console.log("🔥 UTC date time for DB:", appointmentDate.toISOString());

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

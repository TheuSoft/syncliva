"use server";

import dayjs from "dayjs";
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
    console.log("🔥🔥🔥 ACTION EXECUTED - INPUT:", JSON.stringify(parsedInput, null, 2));
    
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
    
    // Convert date and time to datetime  
    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .toDate();
    
    // Create appointment
    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      clinicId: session.user.clinic.id,
      date: appointmentDateTime,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      status: "pending",
    });
    
    console.log("🔥🔥🔥 APPOINTMENT CREATED SUCCESSFULLY");
    
    revalidatePath("/appointments");
    
    return { success: true };
  });

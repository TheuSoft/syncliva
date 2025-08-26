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
    console.log("🔥🔥🔥 ACTION EXECUTED - INPUT:", JSON.stringify(parsedInput, null, 2));
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    console.log("🔥🔥🔥 SESSION:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "receptionist")) {
      throw new Error("Usuário não autorizado para criar agendamentos");
    }
    
    if (!session.user.clinic?.id) {
      throw new Error("Clínica não encontrada na sessão");
    }
    
    // Create appointment
    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      clinicId: session.user.clinic.id,
      date: parsedInput.scheduledAt,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      status: "pending",
    });
    
    console.log("🔥🔥🔥 APPOINTMENT CREATED SUCCESSFULLY");
    
    revalidatePath("/appointments");
    revalidatePath("/receptionist/appointments");
    
    return { success: true };
  });

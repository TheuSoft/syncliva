"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

interface ConfirmAppointmentParams {
  appointmentId: string;
}

type ActionResult = {
  success: boolean;
  message: string;
};

export async function confirmAppointment({
  appointmentId,
}: ConfirmAppointmentParams): Promise<ActionResult> {
  try {
    await db
      .update(appointmentsTable)
      .set({
        status: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId));

    revalidatePath("/dashboard/appointments");
    revalidatePath("/appointments");

    return { success: true, message: "Agendamento confirmado com sucesso!" };
  } catch (error) {
    console.error("Erro ao confirmar agendamento:", error);
    return { success: false, message: "Erro ao confirmar agendamento" };
  }
}

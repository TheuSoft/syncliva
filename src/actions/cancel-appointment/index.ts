"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

interface CancelAppointmentParams {
  appointmentId: string;
}

type ActionResult = {
  success: boolean;
  message: string;
};

export async function cancelAppointment({
  appointmentId,
}: CancelAppointmentParams): Promise<ActionResult> {
  try {
    // Buscar o agendamento antes de cancelar para obter informações
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, appointmentId),
    });

    if (!appointment) {
      return { success: false, message: "Agendamento não encontrado" };
    }

    if (appointment.status === "canceled") {
      return { success: false, message: "Agendamento já está cancelado" };
    }

    // Cancelar o agendamento
    await db
      .update(appointmentsTable)
      .set({
        status: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId));

    // ✅ Revalidar páginas para atualizar disponibilidade de horários
    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    revalidatePath("/reports");
    
    // ✅ Revalidar páginas de agendamento para atualizar horários disponíveis
    revalidatePath("/appointments/new");
    revalidatePath("/appointments/add");

    return { success: true, message: "Agendamento cancelado com sucesso! O horário está novamente disponível." };
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return { success: false, message: "Erro ao cancelar agendamento" };
  }
}

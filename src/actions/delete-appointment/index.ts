"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

interface DeleteAppointmentParams {
  appointmentId: string;
}

type ActionResult = {
  success: boolean;
  message: string;
};

export async function deleteAppointment({
  appointmentId,
}: DeleteAppointmentParams): Promise<ActionResult> {
  try {
    // Verificar se o agendamento existe e está cancelado
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, appointmentId),
    });

    if (!existingAppointment) {
      return { success: false, message: "Agendamento não encontrado" };
    }

    // Verificar se o agendamento está cancelado (só permite excluir cancelados)
    if (existingAppointment.status !== "canceled") {
      return {
        success: false,
        message: "Apenas agendamentos cancelados podem ser excluídos",
      };
    }

    // Excluir o agendamento permanentemente
    await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId));

    revalidatePath("/dashboard/appointments");
    revalidatePath("/appointments");

    return { success: true, message: "Agendamento excluído permanentemente!" };
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return { success: false, message: "Erro ao excluir agendamento" };
  }
}

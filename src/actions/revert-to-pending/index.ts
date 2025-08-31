"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

interface RevertToPendingParams {
  appointmentId: string;
}

type ActionResult = {
  success: boolean;
  message: string;
};

export async function revertToPending({
  appointmentId,
}: RevertToPendingParams): Promise<ActionResult> {
  try {
    // Buscar o agendamento antes de reverter para obter informações
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, appointmentId),
    });

    if (!appointment) {
      return { success: false, message: "Agendamento não encontrado" };
    }

    if (appointment.status !== "confirmed") {
      return {
        success: false,
        message:
          "Apenas agendamentos confirmados podem ser revertidos para pendente",
      };
    }

    // Reverter o agendamento para pendente
    await db
      .update(appointmentsTable)
      .set({
        status: "pending",
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

    return {
      success: true,
      message: "Agendamento revertido para pendente com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao reverter agendamento:", error);
    return { success: false, message: "Erro ao reverter agendamento" };
  }
}

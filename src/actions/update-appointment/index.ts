"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

// ✅ Tipo específico para atualizações (sem 'any')
type PartialAppointmentUpdate = {
  patientId?: string;
  doctorId?: string;
  date?: Date;
  appointmentPriceInCents?: number;
  status?: "pending" | "confirmed" | "canceled";
  updatedAt: Date;
};

interface UpdateAppointmentParams {
  appointmentId: string;
  patientId?: string;
  doctorId?: string;
  date?: Date;
  appointmentPriceInCents?: number;
  status?: "pending" | "confirmed" | "canceled";
}

type ActionResult = {
  success: boolean;
  message: string;
};

export async function updateAppointment({
  appointmentId,
  patientId,
  doctorId,
  date,
  appointmentPriceInCents,
  status,
}: UpdateAppointmentParams): Promise<ActionResult> {
  try {
    // Verificar se o agendamento existe
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, appointmentId),
    });

    if (!existingAppointment) {
      return { success: false, message: "Agendamento não encontrado" };
    }

    // Verificar se o agendamento pode ser editado (não está cancelado nem confirmado)
    if (existingAppointment.status === "canceled") {
      return {
        success: false,
        message: "Não é possível editar um agendamento cancelado",
      };
    }

    if (existingAppointment.status === "confirmed" && status !== "confirmed") {
      return {
        success: false,
        message: "Não é possível editar um agendamento confirmado",
      };
    }

    // ✅ Tipagem específica em vez de 'any'
    const updateData: PartialAppointmentUpdate = {
      updatedAt: new Date(),
    };

    if (patientId !== undefined) updateData.patientId = patientId;
    if (doctorId !== undefined) updateData.doctorId = doctorId;
    if (date !== undefined) updateData.date = date;
    if (appointmentPriceInCents !== undefined) {
      updateData.appointmentPriceInCents = appointmentPriceInCents;
    }
    if (status !== undefined) updateData.status = status;

    await db
      .update(appointmentsTable)
      .set(updateData)
      .where(eq(appointmentsTable.id, appointmentId));

    // Revalidar páginas necessárias
    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    revalidatePath("/reports");

    return { success: true, message: "Agendamento atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return { success: false, message: "Erro ao atualizar agendamento" };
  }
}

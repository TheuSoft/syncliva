"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

// Tipo para dados de edição
type EditAppointmentData = {
  appointmentId: string;
  patientId?: string;
  doctorId?: string;
  date?: Date;
  appointmentPriceInCents?: number;
};

// ✅ NOVO: Tipo específico para dados de atualização
type AppointmentUpdateData = {
  updatedAt: Date;
  patientId?: string;
  doctorId?: string;
  date?: Date;
  appointmentPriceInCents?: number;
};

type ActionResult = {
  success: boolean;
  message: string;
};

export async function editAppointment({
  appointmentId,
  patientId,
  doctorId,
  date,
  appointmentPriceInCents,
}: EditAppointmentData): Promise<ActionResult> {
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

    if (existingAppointment.status === "confirmed") {
      return {
        success: false,
        message: "Não é possível editar um agendamento confirmado",
      };
    }

    // Validar se o paciente existe (se fornecido)
    if (patientId) {
      const patient = await db.query.patientsTable.findFirst({
        where: eq(patientsTable.id, patientId),
      });
      if (!patient) {
        return { success: false, message: "Paciente não encontrado" };
      }
    }

    // Validar se o médico existe (se fornecido)
    if (doctorId) {
      const doctor = await db.query.doctorsTable.findFirst({
        where: eq(doctorsTable.id, doctorId),
      });
      if (!doctor) {
        return { success: false, message: "Médico não encontrado" };
      }
    }

    // Construir dados de atualização
    const updateData: AppointmentUpdateData = {
      updatedAt: new Date(),
    };

    if (patientId !== undefined) updateData.patientId = patientId;
    if (doctorId !== undefined) updateData.doctorId = doctorId;
    if (date !== undefined) updateData.date = date;
    if (appointmentPriceInCents !== undefined) {
      updateData.appointmentPriceInCents = appointmentPriceInCents;
    }

    // Atualizar o agendamento
    await db
      .update(appointmentsTable)
      .set(updateData)
      .where(eq(appointmentsTable.id, appointmentId));

    // Revalidar páginas necessárias
    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    revalidatePath("/reports");

    return { success: true, message: "Agendamento editado com sucesso!" };
  } catch (error) {
    console.error("Erro ao editar agendamento:", error);
    return { success: false, message: "Erro ao editar agendamento" };
  }
}

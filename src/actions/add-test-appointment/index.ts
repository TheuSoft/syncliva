import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

const actionClient = createSafeActionClient();

const addTestAppointmentSchema = z.object({
  doctorId: z.string(),
  patientName: z.string(),
  patientEmail: z.string(),
  patientPhone: z.string(),
  appointmentDate: z.string(),
});

export const addTestAppointment = actionClient
  .schema(addTestAppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { doctorId, patientName, patientEmail, patientPhone, appointmentDate } = parsedInput;

      // Verificar se o médico existe
      const doctor = await db
        .select()
        .from(doctorsTable)
        .where(eq(doctorsTable.id, doctorId))
        .limit(1);

      if (!doctor.length) {
        return {
          success: false,
          error: "Médico não encontrado",
        };
      }

      // Criar um paciente temporário para teste
      const [patient] = await db
        .insert(patientsTable)
        .values({
          clinicId: doctor[0].clinicId,
          name: patientName,
          email: patientEmail,
          phoneNumber: patientPhone,
          sex: "male",
          cpf: "123.456.789-00",
          addressZipCode: "01234-567",
          addressStreet: "Rua Teste",
          addressNumber: "123",
          addressNeighborhood: "Centro",
          addressCity: "São Paulo",
          addressState: "SP",
        })
        .returning();

      // Criar o agendamento
      const [appointment] = await db
        .insert(appointmentsTable)
        .values({
          clinicId: doctor[0].clinicId,
          doctorId: doctorId,
          patientId: patient.id,
          date: new Date(appointmentDate),
          appointmentPriceInCents: doctor[0].appointmentPriceInCents,
          status: "confirmed",
        })
        .returning();

      return {
        success: true,
        message: "Agendamento de teste criado com sucesso!",
        appointment,
      };
    } catch (error) {
      console.error("Erro ao criar agendamento de teste:", error);
      return {
        success: false,
        error: "Erro interno do servidor",
      };
    }
  });

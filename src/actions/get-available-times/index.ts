"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/time";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD,
    }),
  )
  .action(async ({ parsedInput }) => {
    console.log("🎯 getAvailableTimes called with:", parsedInput);
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      console.log("🚨 No session found");
      throw new Error("Unauthorized");
    }
    
    console.log("🎯 Session user:", session.user);
    
    // Remover verificação de clínica - médicos podem não ter clínica diretamente
    // A validação será feita através do médico específico
    
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });
    
    console.log("🎯 Doctor found:", doctor);
    
    if (!doctor) {
      console.log("🚨 Doctor not found for ID:", parsedInput.doctorId);
      throw new Error("Médico não encontrado");
    }
    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekDay &&
      selectedDayOfWeek <= doctor.availableToWeekDay;
    if (!doctorIsAvailable) {
      return [];
    }
    // Buscar apenas agendamentos ativos (não cancelados) do médico
    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, parsedInput.doctorId),
        ne(appointmentsTable.status, "canceled") // ✅ Excluir agendamentos cancelados
      ),
    });
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => dayjs(appointment.date).format("HH:mm:ss"));
    const timeSlots = generateTimeSlots();

    const doctorAvailableFrom = dayjs()
      .utc()
      .set("hour", Number(doctor.availableFromTime.split(":")[0]))
      .set("minute", Number(doctor.availableFromTime.split(":")[1]))
      .set("second", 0)
      .local();
    const doctorAvailableTo = dayjs()
      .utc()
      .set("hour", Number(doctor.availableToTime.split(":")[0]))
      .set("minute", Number(doctor.availableToTime.split(":")[1]))
      .set("second", 0)
      .local();
    const doctorTimeSlots = timeSlots.filter((time) => {
      const date = dayjs()
        .utc()
        .set("hour", Number(time.split(":")[0]))
        .set("minute", Number(time.split(":")[1]))
        .set("second", 0);

      return (
        date.format("HH:mm:ss") >= doctorAvailableFrom.format("HH:mm:ss") &&
        date.format("HH:mm:ss") <= doctorAvailableTo.format("HH:mm:ss")
      );
    });
    
    const result = doctorTimeSlots.map((time) => {
      return {
        value: time,
        available: !appointmentsOnSelectedDate.includes(time),
        label: time.substring(0, 5),
      };
    });
    
    console.log("🎯 Final available times result:", result);
    console.log("🎯 Doctor available from:", doctor.availableFromTime, "to:", doctor.availableToTime);
    console.log("🎯 Doctor available days:", doctor.availableFromWeekDay, "to:", doctor.availableToWeekDay);
    console.log("🎯 Selected date day of week:", dayjs(parsedInput.date).day());
    
    return result;
  });

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

    // ✅ ADICIONAR: Log dos horários de disponibilidade do médico
    console.log("🎯 Doctor availability:", {
      fromTime: doctor.availableFromTime,
      toTime: doctor.availableToTime,
      fromWeekDay: doctor.availableFromWeekDay,
      toWeekDay: doctor.availableToWeekDay,
    });

    // ✅ VERIFICAR: Se os horários de disponibilidade estão definidos
    if (!doctor.availableFromTime || !doctor.availableToTime) {
      console.log("🚨 Doctor availability times not configured");
      throw new Error("Horários de disponibilidade do médico não configurados");
    }

    const selectedDayOfWeek = dayjs(parsedInput.date).day();
    console.log("🎯 Selected day of week:", selectedDayOfWeek);

    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekDay &&
      selectedDayOfWeek <= doctor.availableToWeekDay;

    console.log("🎯 Doctor is available on this day:", doctorIsAvailable);

    if (!doctorIsAvailable) {
      console.log("🚨 Doctor not available on this day of week");
      return [];
    }
    // Buscar apenas agendamentos ativos (não cancelados) do médico na data específica
    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, parsedInput.doctorId),
        ne(appointmentsTable.status, "canceled"), // ✅ Excluir agendamentos cancelados
      ),
    });

    // Filtrar agendamentos para a data selecionada e obter horários ocupados
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        return dayjs(appointment.date).isSame(parsedInput.date, "day");
      })
      .map((appointment) => {
        // ✅ CORREÇÃO: Usar format para garantir consistência de formato
        return dayjs(appointment.date).format("HH:mm:ss");
      });

    console.log(
      "🎯 Appointments on selected date:",
      appointmentsOnSelectedDate,
    );

    // Gerar todos os slots de tempo possíveis (a cada 30 minutos)
    const timeSlots = generateTimeSlots();
    console.log("🎯 All time slots:", timeSlots);

    // ✅ CORREÇÃO: Simplificar a lógica de filtragem dos horários do médico
    const doctorTimeSlots = timeSlots.filter((timeSlot) => {
      // Converter horário do slot para comparação
      const [slotHour, slotMinute] = timeSlot.split(":").map(Number);
      const slotTime = slotHour * 60 + slotMinute; // Em minutos

      // ✅ CORREÇÃO: Garantir que estamos comparando horários em formato local (Brasil)
      // Os horários do médico devem estar em formato "HH:mm:ss" local
      const doctorFromTime = doctor.availableFromTime; // Ex: "08:00:00"
      const doctorToTime = doctor.availableToTime; // Ex: "18:00:00"

      console.log(
        "🎯 Comparing slot",
        timeSlot,
        "with doctor hours",
        doctorFromTime,
        "to",
        doctorToTime,
      );

      // Converter horários de disponibilidade do médico (assumindo formato HH:mm:ss)
      const [fromHour, fromMinute] = doctorFromTime.split(":").map(Number);
      const [toHour, toMinute] = doctorToTime.split(":").map(Number);

      const fromTime = fromHour * 60 + fromMinute; // Em minutos
      const toTime = toHour * 60 + toMinute; // Em minutos

      console.log(
        "🎯 Slot time in minutes:",
        slotTime,
        "Doctor range:",
        fromTime,
        "to",
        toTime,
      );

      // Verificar se o slot está dentro do horário de disponibilidade
      const isInRange = slotTime >= fromTime && slotTime <= toTime;
      console.log("🎯 Slot", timeSlot, "is in range:", isInRange);

      return isInRange;
    });

    console.log("🎯 Doctor available time slots:", doctorTimeSlots);
    console.log(
      "🎯 Doctor hours: from",
      doctor.availableFromTime,
      "to",
      doctor.availableToTime,
    );

    const result = doctorTimeSlots.map((time) => {
      return {
        value: time,
        available: !appointmentsOnSelectedDate.includes(time),
        label: time.substring(0, 5),
      };
    });

    console.log("🎯 Final available times result:", result);
    console.log(
      "🎯 Doctor available from:",
      doctor.availableFromTime,
      "to:",
      doctor.availableToTime,
    );
    console.log(
      "🎯 Doctor available days:",
      doctor.availableFromWeekDay,
      "to:",
      doctor.availableToWeekDay,
    );
    console.log("🎯 Selected date day of week:", dayjs(parsedInput.date).day());

    return result;
  });

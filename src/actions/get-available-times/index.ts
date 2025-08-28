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

// Configurar timezone padrão para Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD
      excludeAppointmentId: z.string().optional(), // ID do agendamento a ser excluído da verificação
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

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });

    console.log("🎯 Doctor found:", doctor);

    if (!doctor) {
      console.log("🚨 Doctor not found for ID:", parsedInput.doctorId);
      throw new Error("Médico não encontrado");
    }

    console.log("🎯 Doctor availability:", {
      fromTime: doctor.availableFromTime,
      toTime: doctor.availableToTime,
      fromWeekDay: doctor.availableFromWeekDay,
      toWeekDay: doctor.availableToWeekDay,
    });

    if (!doctor.availableFromTime || !doctor.availableToTime) {
      console.log("🚨 Doctor availability times not configured");
      throw new Error("Horários de disponibilidade do médico não configurados");
    }

    // Verificar se o médico trabalha no dia da semana selecionado
    const selectedDayOfWeek = dayjs(parsedInput.date).tz(BRAZIL_TIMEZONE).day();
    console.log("🎯 Selected day of week:", selectedDayOfWeek);

    const doctorIsAvailable =
      selectedDayOfWeek >= doctor.availableFromWeekDay &&
      selectedDayOfWeek <= doctor.availableToWeekDay;

    console.log("🎯 Doctor is available on this day:", doctorIsAvailable);

    if (!doctorIsAvailable) {
      console.log("🚨 Doctor not available on this day of week");
      return [];
    }

    // Buscar agendamentos ativos (não cancelados) do médico
    const whereConditions = [
      eq(appointmentsTable.doctorId, parsedInput.doctorId),
      ne(appointmentsTable.status, "canceled"),
    ];

    // Adicionar condição para excluir o agendamento atual se fornecido
    if (parsedInput.excludeAppointmentId) {
      whereConditions.push(
        ne(appointmentsTable.id, parsedInput.excludeAppointmentId),
      );
    }

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(...whereConditions),
    });

    // Filtrar agendamentos para a data selecionada (considerando timezone)
    const appointmentsOnSelectedDate = appointments
      .filter((appointment) => {
        // Converter data do agendamento para timezone local e comparar
        const appointmentDateLocal = dayjs(appointment.date)
          .tz(BRAZIL_TIMEZONE)
          .format("YYYY-MM-DD");
        return appointmentDateLocal === parsedInput.date;
      })
      .map((appointment) => {
        // Extrair horário em timezone local
        return dayjs(appointment.date).tz(BRAZIL_TIMEZONE).format("HH:mm:ss");
      });

    console.log(
      "🎯 Appointments on selected date:",
      appointmentsOnSelectedDate,
    );

    // Gerar todos os slots de tempo possíveis
    const timeSlots = generateTimeSlots();
    console.log("🎯 All time slots:", timeSlots);

    // Filtrar slots dentro do horário de disponibilidade do médico
    const doctorTimeSlots = timeSlots.filter((timeSlot) => {
      const [slotHour, slotMinute] = timeSlot.split(":").map(Number);
      const slotTime = slotHour * 60 + slotMinute; // Em minutos

      // Horários de disponibilidade do médico (formato HH:mm:ss)
      const [fromHour, fromMinute] = doctor.availableFromTime
        .split(":")
        .map(Number);
      const [toHour, toMinute] = doctor.availableToTime.split(":").map(Number);

      const fromTime = fromHour * 60 + fromMinute; // Em minutos
      const toTime = toHour * 60 + toMinute; // Em minutos

      console.log(
        "🎯 Comparing slot",
        timeSlot,
        "with doctor hours",
        doctor.availableFromTime,
        "to",
        doctor.availableToTime,
      );

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

    // Criar resultado final com disponibilidade
    const result = doctorTimeSlots.map((time) => {
      return {
        value: time,
        available: !appointmentsOnSelectedDate.includes(time),
        label: time.substring(0, 5), // Mostrar apenas HH:mm
      };
    });

    // Se estamos editando um agendamento, garantir que o horário atual esteja na lista
    if (parsedInput.excludeAppointmentId) {
      // Buscar o agendamento atual para obter seu horário
      const currentAppointment = await db.query.appointmentsTable.findFirst({
        where: eq(appointmentsTable.id, parsedInput.excludeAppointmentId),
      });

      if (currentAppointment) {
        const currentAppointmentTime = dayjs(currentAppointment.date)
          .tz(BRAZIL_TIMEZONE)
          .format("HH:mm:ss");

        const currentAppointmentTimeShort = currentAppointmentTime.substring(
          0,
          5,
        );

        // Verificar se o horário atual já está na lista
        const timeExists = result.some(
          (t) => t.value === currentAppointmentTime,
        );

        if (!timeExists) {
          // Adicionar o horário atual à lista como disponível
          result.push({
            value: currentAppointmentTime,
            available: true,
            label: currentAppointmentTimeShort,
          });
        } else {
          // Marcar o horário atual como disponível
          const timeIndex = result.findIndex(
            (t) => t.value === currentAppointmentTime,
          );
          if (timeIndex !== -1) {
            result[timeIndex].available = true;
          }
        }
      }
    }

    // Ordenar a lista de horários
    result.sort((a, b) => a.value.localeCompare(b.value));

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
    console.log(
      "🎯 Selected date day of week:",
      dayjs(parsedInput.date).tz(BRAZIL_TIMEZONE).day(),
    );

    return result;
  });

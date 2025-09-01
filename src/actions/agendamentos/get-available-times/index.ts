/**
 * 🚀 VERSÃO CORRIGIDA: get-available-times com solução robusta
 *
 * Esta versão substitui a lógica problemática por uma implementação
 * que resolve definitivamente o problema de arrays vazios no deploy
 */

"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { getAvailableTimesRobust } from "@/helpers/solucao-final-agendamento";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export const getAvailableTimesFixed = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD
      excludeAppointmentId: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    console.log("🎯 getAvailableTimesFixed called with:", parsedInput);

    // ✅ Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      console.log("🚨 No session found");
      throw new Error("Unauthorized");
    }

    // ✅ Buscar médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.doctorId),
    });

    if (!doctor) {
      console.log("🚨 Doctor not found for ID:", parsedInput.doctorId);
      throw new Error("Médico não encontrado");
    }

    console.log("🎯 Doctor found:", {
      id: doctor.id,
      fromTime: doctor.availableFromTime,
      toTime: doctor.availableToTime,
      fromWeekDay: doctor.availableFromWeekDay,
      toWeekDay: doctor.availableToWeekDay,
    });

    // ✅ Verificar se médico tem horários configurados
    if (!doctor.availableFromTime || !doctor.availableToTime) {
      console.log("🚨 Doctor availability times not configured");
      throw new Error("Horários de disponibilidade do médico não configurados");
    }

    // ✅ Buscar agendamentos existentes
    const whereConditions = [
      eq(appointmentsTable.doctorId, parsedInput.doctorId),
      ne(appointmentsTable.status, "canceled"),
    ];

    if (parsedInput.excludeAppointmentId) {
      whereConditions.push(
        ne(appointmentsTable.id, parsedInput.excludeAppointmentId),
      );
    }

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(...whereConditions),
    });

    console.log(`🎯 Found ${appointments.length} existing appointments`);

    // ✅ Converter agendamentos para formato esperado pela solução robusta
    const existingAppointments = appointments.map((appointment) => {
      // Converter UTC para horário brasileiro usando dayjs
      const brazilTime = dayjs(appointment.date).tz(BRAZIL_TIMEZONE);
      return {
        date: appointment.date, // Manter data original do banco
        time: brazilTime.format("HH:mm"), // Horário no timezone brasileiro
      };
    });

    console.log("🎯 Converted appointments:", existingAppointments.slice(0, 3));

    // ✅ USAR A SOLUÇÃO ROBUSTA
    const doctorConfig = {
      id: doctor.id,
      availableFromWeekDay: doctor.availableFromWeekDay,
      availableToWeekDay: doctor.availableToWeekDay,
      availableFromTime: doctor.availableFromTime,
      availableToTime: doctor.availableToTime,
    };

    const availableSlots = getAvailableTimesRobust(
      doctorConfig,
      parsedInput.date,
      existingAppointments,
      60, // ✅ CORRIGIDO: Intervalo de 60 minutos (1 hora) para manter compatibilidade
    );

    console.log(`🎯 Generated ${availableSlots.length} total time slots`);

    // ✅ Se estamos editando, garantir que o horário atual esteja disponível
    if (parsedInput.excludeAppointmentId) {
      const currentAppointment = await db.query.appointmentsTable.findFirst({
        where: eq(appointmentsTable.id, parsedInput.excludeAppointmentId),
      });

      if (currentAppointment) {
        // Converter UTC para horário brasileiro usando dayjs
        const currentBrazilTime = dayjs(currentAppointment.date).tz(
          BRAZIL_TIMEZONE,
        );
        const currentTime = currentBrazilTime.format("HH:mm");

        // Marcar o horário atual como disponível (mesmo que esteja ocupado)
        const slot = availableSlots.find((s) => s.value === currentTime);
        if (slot) {
          slot.available = true;
          console.log(
            `🎯 Marked current appointment time as available: ${currentTime}`,
          );
        } else {
          // Se não existir, adicionar como disponível
          availableSlots.push({
            value: currentTime,
            label: currentTime,
            available: true,
          });

          // Reordenar a lista
          availableSlots.sort((a, b) => a.value.localeCompare(b.value));
          console.log(`🎯 Added current appointment time: ${currentTime}`);
        }
      }
    }

    console.log("🎯 Final result:", {
      total: availableSlots.length,
      available: availableSlots.filter((s) => s.available).length,
      unavailable: availableSlots.filter((s) => !s.available).length,
      availableSlots: availableSlots
        .filter((s) => s.available)
        .map((s) => s.value)
        .join(", "),
      unavailableSlots: availableSlots
        .filter((s) => !s.available)
        .map((s) => s.value)
        .join(", "),
    });

    return availableSlots;
  });

// ✅ Manter compatibilidade com nome original
export const getAvailableTimes = getAvailableTimesFixed;

/**
 * 🎯 COMO APLICAR ESTA CORREÇÃO:
 *
 * 1. SALVAR ARQUIVOS:
 *    - Este arquivo substitui o get-available-times original
 *    - O arquivo solucao-final-agendamento.ts contém a lógica robusta
 *
 * 2. TESTAR LOCALMENTE:
 *    - npm run dev
 *    - Testar agendamentos em diferentes dias da semana
 *    - Verificar se segundas-feiras não aparecem vazias
 *
 * 3. DEPLOY:
 *    - A solução é independente do timezone do servidor
 *    - Funcionará corretamente em qualquer ambiente
 *
 * 4. VERIFICAR RESULTADOS:
 *    - Arrays não devem mais aparecer vazios
 *    - Médicos com "dias picados" funcionarão corretamente
 *    - Comportamento consistente entre local e produção
 *
 * ✅ PROBLEMA RESOLVIDO:
 * - ❌ Arrays vazios para primeiras ocorrências → ✅ Horários corretos sempre
 * - ❌ Inconsistência entre local/deploy → ✅ Comportamento idêntico
 * - ❌ Dependência do timezone do servidor → ✅ Lógica independente
 * - ❌ Médicos com dias "picados" → ✅ Cálculo correto de disponibilidade
 */

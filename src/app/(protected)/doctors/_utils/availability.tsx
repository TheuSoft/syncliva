import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { doctorsTable } from "@/db/schema";

dayjs.extend(utc);
dayjs.locale("pt-br");

/**
 * Calcula a disponibilidade do médico formatada
 * @param doctor - Dados do médico
 * @returns Objeto com horários de início e fim formatados
 */
export const getAvailability = (doctor: typeof doctorsTable.$inferSelect) => {
  // ✅ CORREÇÃO: Manter horários como estão, sem conversões UTC desnecessárias
  const from = dayjs()
    .day(doctor.availableFromWeekDay)
    .set("hour", Number(doctor.availableFromTime.split(":")[0]))
    .set("minute", Number(doctor.availableFromTime.split(":")[1]))
    .set("second", Number(doctor.availableFromTime.split(":")[2] || 0));

  const to = dayjs()
    .day(doctor.availableToWeekDay)
    .set("hour", Number(doctor.availableToTime.split(":")[0]))
    .set("minute", Number(doctor.availableToTime.split(":")[1]))
    .set("second", Number(doctor.availableToTime.split(":")[2] || 0));

  return { from, to };
};

/**
 * Gera slots de horários disponíveis para agendamentos
 * @returns Array de strings no formato "HH:mm:ss" com intervalos de 1 hora
 */
export const generateTimeSlots = () => {
  const slots = [];
  // ✅ HORÁRIOS: Gerar slots das 07:00 às 20:00 (07h às 20h) - Intervalo de 1:00h
  for (let hour = 7; hour <= 20; hour++) {
    const timeString = `${hour.toString().padStart(2, "0")}:00:00`;
    slots.push(timeString);
  }
  return slots;
};

/**
 * Formata valores em centavos para moeda brasileira
 * @param amount - Valor em centavos
 * @returns String formatada em reais (R$)
 */
export const formatCurrencyInCents = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
};

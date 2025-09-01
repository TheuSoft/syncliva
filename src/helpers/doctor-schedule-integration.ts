/**
 * 🔗 INTEGRAÇÃO COM O SISTEMA EXISTENTE
 *
 * Exemplo de como adaptar a solução para seu sistema de agendamento
 */

import type { DoctorScheduleConfig } from "./doctor-schedule";
import { generateDoctorSchedule } from "./doctor-schedule";

// ✅ Adapter para seu sistema atual
export function adaptarParaSistemaExistente(
  doctor: {
    id: string;
    availableFromWeekDay: number;
    availableToWeekDay: number;
    availableFromTime: string;
    availableToTime: string;
  },
  startDate: string,
  endDate: string,
  existingAppointments: Array<{ date: Date }>,
) {
  // ✅ CORREÇÃO: Converter agendamentos existentes para formato correto
  const formattedAppointments = existingAppointments.map((apt) => ({
    date: formatDateToYYYYMMDD(apt.date),
    time: formatTimeToHHMM(apt.date),
  }));

  // ✅ Configurar médico
  const doctorConfig: DoctorScheduleConfig = {
    doctorId: doctor.id,
    availableFromWeekDay: doctor.availableFromWeekDay,
    availableToWeekDay: doctor.availableToWeekDay,
    availableFromTime: doctor.availableFromTime,
    availableToTime: doctor.availableToTime,
    intervalMinutes: 30,
  };

  // ✅ Gerar agenda
  const schedule = generateDoctorSchedule({
    doctorConfig,
    startDate,
    endDate,
    existingAppointments: formattedAppointments,
  });

  // ✅ Converter para formato que seu sistema espera
  return schedule.map((day) => ({
    date: day.date,
    dayOfWeek: day.dayOfWeek,
    availableSlots: day.availableSlots.map((time) => ({
      value: time,
      label: time,
      available: true,
    })),
  }));
}

// ✅ Helpers para conversão
function formatDateToYYYYMMDD(date: Date): string {
  // IMPORTANTE: Usar componentes locais, não UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeToHHMM(date: Date): string {
  // IMPORTANTE: Usar horário local, não UTC
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ✅ EXEMPLO: Como substituir sua função get-available-times
export async function getAvailableTimesRobust(
  doctorId: string,
  dateString: string, // YYYY-MM-DD
) {
  // 1. Buscar dados do médico no banco
  const doctor = await buscarMedicoNoBanco(doctorId);

  // 2. Buscar agendamentos existentes
  const existingAppointments = await buscarAgendamentosExistentes(
    doctorId,
    dateString,
  );

  // 3. Gerar horários disponíveis para o dia específico
  const schedule = generateDoctorSchedule({
    doctorConfig: {
      doctorId: doctor.id,
      availableFromWeekDay: doctor.availableFromWeekDay,
      availableToWeekDay: doctor.availableToWeekDay,
      availableFromTime: doctor.availableFromTime,
      availableToTime: doctor.availableToTime,
      intervalMinutes: 30,
    },
    startDate: dateString,
    endDate: dateString, // Apenas um dia
    existingAppointments: existingAppointments.map((apt) => ({
      date: formatDateToYYYYMMDD(new Date(apt.date)),
      time: formatTimeToHHMM(new Date(apt.date)),
    })),
  });

  // 4. Retornar horários do dia solicitado
  const daySchedule = schedule.find((day) => day.date === dateString);

  return {
    success: true,
    data:
      daySchedule?.availableSlots.map((time) => ({
        value: time,
        label: time,
        available: true,
      })) || [],
  };
}

// ✅ Mocks das funções do banco (substitua pelas suas)
async function buscarMedicoNoBanco(doctorId: string) {
  // Substitua pela sua query real
  return {
    id: doctorId,
    availableFromWeekDay: 1, // Segunda
    availableToWeekDay: 5, // Sexta
    availableFromTime: "08:00:00",
    availableToTime: "18:00:00",
  };
}

async function buscarAgendamentosExistentes(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doctorId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  date: string,
): Promise<Array<{ date: string }>> {
  // Substitua pela sua query real
  return [
    // { date: '2025-09-01T09:00:00' },
    // { date: '2025-09-01T14:30:00' }
  ];
}

// ✅ TESTE PARA VALIDAR A SOLUÇÃO
export function testarSolucao() {
  console.log("🧪 TESTE: Médico que atende Segunda a Sexta");

  const result = adaptarParaSistemaExistente(
    {
      id: "dr-teste",
      availableFromWeekDay: 1, // Segunda
      availableToWeekDay: 5, // Sexta
      availableFromTime: "08:00:00",
      availableToTime: "12:00:00",
    },
    "2025-09-02", // Segunda-feira
    "2025-09-08", // Domingo
    [],
  );

  console.log("📊 RESULTADO:");
  result.forEach((day) => {
    console.log(
      `${day.date} (dia ${day.dayOfWeek}): ${day.availableSlots.length} horários`,
    );
  });

  // ✅ Verificar se segunda-feira tem horários (era o problema relatado)
  const segunda = result.find((day) => day.dayOfWeek === 1);
  console.log(
    "🔍 Segunda-feira tem horários?",
    segunda ? segunda.availableSlots.length > 0 : false,
  );

  return result;
}

/**
 * 🚀 EXEMPLO PRÁTICO: Como implementar a solução no seu sistema
 *
 * Este arquivo mostra exatamente como substituir sua função get-available-times
 * para resolver o problema dos arrays vazios no deploy
 */

import type { DoctorScheduleConfig } from "./doctor-schedule";
import { generateDoctorSchedule } from "./doctor-schedule";

// ✅ Interface para o resultado esperado pelo seu sistema
interface AvailableTimeSlot {
  value: string;
  label: string;
  available: boolean;
}

interface GetAvailableTimesResult {
  success: boolean;
  data: AvailableTimeSlot[];
}

/**
 * 🎯 FUNÇÃO PRINCIPAL: Substitua sua get-available-times por esta
 *
 * Esta função resolve o problema de arrays vazios no deploy
 * garantindo que o cálculo de dias da semana seja consistente
 */
export async function getAvailableTimesFixed(
  doctorId: string,
  dateString: string, // formato YYYY-MM-DD
): Promise<GetAvailableTimesResult> {
  console.log(
    `🏥 Buscando horários para médico ${doctorId} na data ${dateString}`,
  );

  try {
    // 1. ✅ Buscar dados do médico no banco
    const doctor = await getDoctorFromDatabase(doctorId);
    if (!doctor) {
      return { success: false, data: [] };
    }

    // 2. ✅ Buscar agendamentos existentes para a data
    const existingAppointments = await getExistingAppointments(
      doctorId,
      dateString,
    );

    // 3. ✅ Converter para formato esperado pela função
    const formattedAppointments = existingAppointments.map((apt) => ({
      date: dateString,
      time: formatDateToTime(apt.date),
    }));

    // 4. ✅ Configurar horários do médico
    const doctorConfig: DoctorScheduleConfig = {
      doctorId: doctor.id,
      availableFromWeekDay: doctor.availableFromWeekDay,
      availableToWeekDay: doctor.availableToWeekDay,
      availableFromTime: normalizeTimeFormat(doctor.availableFromTime),
      availableToTime: normalizeTimeFormat(doctor.availableToTime),
      intervalMinutes: 30,
    };

    console.log(`📋 Configuração do médico:`, doctorConfig);

    // 5. ✅ Gerar horários usando a nova função robusta
    const schedule = generateDoctorSchedule({
      doctorConfig,
      startDate: dateString,
      endDate: dateString, // Apenas um dia
      existingAppointments: formattedAppointments,
    });

    // 6. ✅ Extrair horários do dia solicitado
    const daySchedule = schedule.find((day) => day.date === dateString);

    if (!daySchedule) {
      console.log(
        `❌ Médico não atende no dia ${dateString} (dia da semana: ${getDayOfWeek(dateString)})`,
      );
      return { success: true, data: [] };
    }

    // 7. ✅ Converter para formato esperado pelo frontend
    const availableSlots: AvailableTimeSlot[] = daySchedule.availableSlots.map(
      (time) => ({
        value: time,
        label: time,
        available: true,
      }),
    );

    console.log(
      `✅ ${availableSlots.length} horários disponíveis para ${dateString}`,
    );
    console.log(`🕐 Horários: ${daySchedule.availableSlots.join(", ")}`);

    return {
      success: true,
      data: availableSlots,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar horários disponíveis:", error);
    return { success: false, data: [] };
  }
}

// ✅ Função auxiliar: normalizar formato de tempo
function normalizeTimeFormat(time: string): string {
  // Converte "08:00:00" para "08:00" ou mantém "08:00" como está
  return time.substring(0, 5);
}

// ✅ Função auxiliar: converter Date para HH:mm
function formatDateToTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ✅ Função auxiliar: obter dia da semana de string
function getDayOfWeek(dateString: string): number {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay();
}

// ✅ MOCK: Substitua pelas suas funções reais do banco
async function getDoctorFromDatabase(doctorId: string) {
  // TODO: Substitua pela sua query real
  // Exemplo usando Drizzle ORM:
  /*
  return await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.id, doctorId)
  });
  */

  // Mock para teste
  return {
    id: doctorId,
    availableFromWeekDay: 1, // Segunda
    availableToWeekDay: 5, // Sexta
    availableFromTime: "08:00:00",
    availableToTime: "18:00:00",
  };
}

async function getExistingAppointments(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doctorId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dateString: string,
): Promise<Array<{ date: Date }>> {
  // TODO: Substitua pela sua query real
  // Exemplo usando Drizzle ORM:
  /*
  const startOfDay = new Date(dateString + 'T00:00:00');
  const endOfDay = new Date(dateString + 'T23:59:59');
  
  return await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.doctorId, doctorId),
      gte(appointmentsTable.date, startOfDay),
      lte(appointmentsTable.date, endOfDay)
    )
  });
  */

  // Mock para teste
  return [];
}

// ✅ EXEMPLO DE TESTE
export function exemploDeUso() {
  console.log("🧪 TESTANDO A SOLUÇÃO...");

  // Teste para diferentes dias da semana
  const testCases = [
    "2025-09-01", // Segunda-feira
    "2025-09-02", // Terça-feira
    "2025-09-05", // Sexta-feira
    "2025-09-06", // Sábado (não deve ter horários)
    "2025-09-07", // Domingo (não deve ter horários)
  ];

  testCases.forEach(async (date) => {
    console.log(`\n📅 Testando ${date}:`);
    const result = await getAvailableTimesFixed("dr-teste", date);
    console.log(`   Resultado: ${result.data.length} horários disponíveis`);

    if (result.data.length > 0) {
      console.log(
        `   Horários: ${result.data.map((slot) => slot.value).join(", ")}`,
      );
    }
  });
}

// ✅ DEMONSTRAÇÃO: Diferença entre abordagem antiga e nova
export function demonstrarDiferenca() {
  console.log("🔍 DEMONSTRANDO A DIFERENÇA...");

  // Problema da abordagem antiga:
  console.log("\n❌ PROBLEMA ANTIGO:");
  console.log(
    '- Data criada: new Date("2025-09-01") em UTC pode ser 2025-08-31 local',
  );
  console.log("- getDay() em UTC: Domingo (0)");
  console.log("- getDay() em local: Segunda (1)");
  console.log("- Resultado: Arrays vazios para segundas-feiras no deploy");

  // Solução da nova abordagem:
  console.log("\n✅ SOLUÇÃO NOVA:");
  console.log("- Data criada: new Date(2025, 8, 1) sempre é 1 de setembro");
  console.log("- getDay() sempre retorna Segunda (1) independente do timezone");
  console.log(
    "- Resultado: Arrays preenchidos corretamente em qualquer ambiente",
  );
}

/**
 * 🔧 GUIA DE IMPLEMENTAÇÃO:
 *
 * 1. Substitua sua função get-available-times por getAvailableTimesFixed
 * 2. Implemente getDoctorFromDatabase com sua query real
 * 3. Implemente getExistingAppointments com sua query real
 * 4. Teste localmente e no deploy
 * 5. Verifique se segundas-feiras agora têm horários disponíveis
 *
 * 📊 RESULTADO ESPERADO:
 * - ✅ Arrays de horários preenchidos para todos os dias de atendimento
 * - ✅ Comportamento consistente entre local e deploy
 * - ✅ Resolução definitiva do problema de "primeira ocorrência vazia"
 */

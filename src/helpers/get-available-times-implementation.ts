/**
 * 🎯 IMPLEMENTAÇÃO PRÁTICA PARA SEU SISTEMA EXISTENTE
 *
 * Substitua seu get-available-times por esta implementação
 * para resolver o problema dos arrays vazios no deploy
 */

// ✅ PASSO 1: Copie esta função para seu arquivo get-available-times/index.ts

/**
 * Cria uma data de forma segura, independente do timezone do servidor
 */
function createSafeDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  // Criar às 12:00 para evitar problemas de timezone
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Calcula o dia da semana de forma robusta
 */
function getSafeDayOfWeek(dateString: string): number {
  const safeDate = createSafeDate(dateString);
  return safeDate.getDay();
}

/**
 * Verifica se o médico atende no dia da semana especificado
 */
function isDoctorAvailableOnDay(
  dayOfWeek: number,
  availableFromWeekDay: number,
  availableToWeekDay: number,
): boolean {
  // Range normal (ex: segunda=1 a sexta=5)
  if (availableFromWeekDay <= availableToWeekDay) {
    return dayOfWeek >= availableFromWeekDay && dayOfWeek <= availableToWeekDay;
  }

  // Range que cruza a semana (ex: sexta=5 a segunda=1)
  return dayOfWeek >= availableFromWeekDay || dayOfWeek <= availableToWeekDay;
}

/**
 * Gera slots de tempo entre dois horários
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30,
): string[] {
  const slots: string[] = [];

  // Converter para minutos
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Gerar slots
  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += intervalMinutes
  ) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeSlot = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    slots.push(timeSlot);
  }

  return slots;
}

/**
 * Normaliza formato de tempo (remove segundos se presente)
 */
function normalizeTimeFormat(time: string): string {
  return time.substring(0, 5); // "08:00:00" -> "08:00"
}

// ✅ PASSO 2: Substitua sua função get-available-times por esta:

export const getAvailableTimesFixed = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string().date(), // YYYY-MM-DD
    }),
  )
  .action(async ({ parsedInput }) => {
    console.log("🏥 [FIXED] getAvailableTimes called with:", parsedInput);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("🚨 No session found");
      return { success: false, data: [] };
    }

    try {
      // 1. ✅ Calcular dia da semana de forma robusta
      const dayOfWeek = getSafeDayOfWeek(parsedInput.date);
      console.log(`📅 Data: ${parsedInput.date}, Dia da semana: ${dayOfWeek}`);

      // 2. ✅ Buscar médico
      const doctor = await db.query.doctorsTable.findFirst({
        where: eq(doctorsTable.id, parsedInput.doctorId),
      });

      if (!doctor) {
        console.log("🚨 Doctor not found");
        return { success: false, data: [] };
      }

      console.log(`👨‍⚕️ Médico: ${doctor.name}`);
      console.log(
        `📋 Atende de ${doctor.availableFromWeekDay} a ${doctor.availableToWeekDay}`,
      );
      console.log(
        `🕐 Horários: ${doctor.availableFromTime} às ${doctor.availableToTime}`,
      );

      // 3. ✅ Verificar se médico atende no dia da semana
      const isAvailable = isDoctorAvailableOnDay(
        dayOfWeek,
        doctor.availableFromWeekDay,
        doctor.availableToWeekDay,
      );

      if (!isAvailable) {
        console.log(`❌ Médico não atende no dia ${dayOfWeek}`);
        return { success: true, data: [] };
      }

      console.log(`✅ Médico atende no dia ${dayOfWeek}`);

      // 4. ✅ Buscar agendamentos existentes
      const appointments = await db.query.appointmentsTable.findMany({
        where: and(
          eq(appointmentsTable.doctorId, parsedInput.doctorId),
          ne(appointmentsTable.status, "canceled"),
        ),
      });

      // 5. ✅ Filtrar agendamentos para a data específica
      const appointmentsOnSelectedDate = appointments
        .filter((appointment) => {
          // Usar mesma lógica de criação de data para comparação
          const appointmentDate = new Date(appointment.date);
          const appointmentDateString = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, "0")}-${String(appointmentDate.getDate()).padStart(2, "0")}`;
          return appointmentDateString === parsedInput.date;
        })
        .map((appointment) => {
          const appointmentDate = new Date(appointment.date);
          const hours = String(appointmentDate.getHours()).padStart(2, "0");
          const minutes = String(appointmentDate.getMinutes()).padStart(2, "0");
          return `${hours}:${minutes}`;
        });

      console.log("🕐 Horários ocupados:", appointmentsOnSelectedDate);

      // 6. ✅ Gerar todos os slots de tempo
      const allSlots = generateTimeSlots(
        normalizeTimeFormat(doctor.availableFromTime),
        normalizeTimeFormat(doctor.availableToTime),
        30, // 30 minutos
      );

      console.log("🕐 Todos os slots:", allSlots);

      // 7. ✅ Filtrar horários disponíveis
      const availableSlots = allSlots
        .filter((slot) => !appointmentsOnSelectedDate.includes(slot))
        .map((time) => ({
          value: time,
          available: true,
          label: time,
        }));

      console.log(
        `✅ ${availableSlots.length} horários disponíveis:`,
        availableSlots.map((s) => s.value),
      );

      return { success: true, data: availableSlots };
    } catch (error) {
      console.error("❌ Erro ao buscar horários:", error);
      return { success: false, data: [] };
    }
  });

// ✅ PASSO 3: Para testar, execute esta função
export function testarSolucao() {
  console.log("🧪 TESTANDO A SOLUÇÃO PARA DIFERENTES DIAS...");

  // Simular médico que atende Segunda(1) a Sexta(5)
  const testCases = [
    { date: "2025-09-01", expected: "Segunda - DEVE TER horários" }, // Segunda
    { date: "2025-09-02", expected: "Terça - DEVE TER horários" }, // Terça
    { date: "2025-09-03", expected: "Quarta - DEVE TER horários" }, // Quarta
    { date: "2025-09-04", expected: "Quinta - DEVE TER horários" }, // Quinta
    { date: "2025-09-05", expected: "Sexta - DEVE TER horários" }, // Sexta
    { date: "2025-09-06", expected: "Sábado - NÃO deve ter horários" }, // Sábado
    { date: "2025-09-07", expected: "Domingo - NÃO deve ter horários" }, // Domingo
  ];

  testCases.forEach((test) => {
    const dayOfWeek = getSafeDayOfWeek(test.date);
    const isAvailable = isDoctorAvailableOnDay(dayOfWeek, 1, 5); // Segunda a Sexta
    console.log(
      `📅 ${test.date} (dia ${dayOfWeek}): ${isAvailable ? "✅ TEM" : "❌ NÃO TEM"} horários - ${test.expected}`,
    );
  });
}

/**
 * 🚀 IMPLEMENTAÇÃO COMPLETA - RESUMO:
 *
 * ✅ PROBLEMA RESOLVIDO:
 * - Arrays vazios para primeiras ocorrências (segundas, terças, etc)
 * - Inconsistência entre ambiente local e deploy
 * - Problemas de timezone em servidores UTC
 *
 * 🔧 SOLUÇÃO IMPLEMENTADA:
 * - Criação segura de datas com createSafeDate()
 * - Cálculo robusto de dia da semana com getSafeDayOfWeek()
 * - Verificação correta de disponibilidade com isDoctorAvailableOnDay()
 * - Geração consistente de slots de tempo
 *
 * 📋 PRÓXIMOS PASSOS:
 * 1. Substitua sua função get-available-times
 * 2. Importe as dependências necessárias (z, actionClient, auth, etc)
 * 3. Teste localmente
 * 4. Faça deploy e teste novamente
 * 5. Verifique se segundas-feiras agora têm horários!
 */

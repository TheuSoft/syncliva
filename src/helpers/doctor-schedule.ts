/**
 * 🏥 SISTEMA DE AGENDAMENTO MÉDICO - GERAÇÃO DE HORÁRIOS
 *
 * Solução robusta para gerar horários disponíveis de médicos
 * que funciona tanto localmente quanto em deploy (UTC)
 */

// ✅ Tipos para o sistema
export interface DoctorScheduleConfig {
  /** ID do médico */
  doctorId: string;
  /** Dia inicial da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado) */
  availableFromWeekDay: number;
  /** Dia final da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado) */
  availableToWeekDay: number;
  /** Horário inicial (formato HH:mm:ss ou HH:mm) */
  availableFromTime: string;
  /** Horário final (formato HH:mm:ss ou HH:mm) */
  availableToTime: string;
  /** Intervalo entre consultas em minutos (padrão: 30) */
  intervalMinutes?: number;
}

export interface DoctorScheduleResult {
  /** Data no formato YYYY-MM-DD */
  date: string;
  /** Array de horários disponíveis no formato HH:mm */
  availableSlots: string[];
  /** Dia da semana (0-6) */
  dayOfWeek: number;
  /** Nome do dia da semana */
  dayName: string;
}

export interface GenerateScheduleParams {
  /** Configuração do médico */
  doctorConfig: DoctorScheduleConfig;
  /** Data inicial (formato YYYY-MM-DD) */
  startDate: string;
  /** Data final (formato YYYY-MM-DD) */
  endDate: string;
  /** Agendamentos já existentes (opcional) */
  existingAppointments?: Array<{
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
  }>;
}

// ✅ Constantes para dias da semana
const WEEK_DAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/**
 * 🔧 FUNÇÃO PRINCIPAL: Gera agenda completa do médico
 *
 * Esta função resolve os problemas de timezone criando datas de forma explícita
 * e garantindo que o dia da semana seja calculado corretamente independente do servidor
 */
export function generateDoctorSchedule({
  doctorConfig,
  startDate,
  endDate,
  existingAppointments = [],
}: GenerateScheduleParams): DoctorScheduleResult[] {
  console.log("🏥 Gerando agenda para médico:", doctorConfig.doctorId);
  console.log("📅 Período:", startDate, "até", endDate);
  console.log(
    "📋 Dias de atendimento:",
    doctorConfig.availableFromWeekDay,
    "até",
    doctorConfig.availableToWeekDay,
  );

  const schedule: DoctorScheduleResult[] = [];

  // ✅ CORREÇÃO 1: Criar datas de forma explícita para evitar problemas de timezone
  const start = createSafeDate(startDate);
  const end = createSafeDate(endDate);

  console.log("🔍 Datas criadas - Start:", start, "End:", end);

  // ✅ CORREÇÃO 2: Iterar dia por dia de forma segura
  const currentDate = new Date(start);

  while (currentDate <= end) {
    // ✅ CORREÇÃO 3: Calcular dia da semana de forma explícita
    const dayOfWeek = getSafeDayOfWeek(currentDate);
    const dateString = formatDateToYYYYMMDD(currentDate);

    console.log(
      `📆 Processando ${dateString} (dia ${dayOfWeek} - ${WEEK_DAYS[dayOfWeek]})`,
    );

    // ✅ CORREÇÃO 4: Verificar se o médico atende neste dia da semana
    if (isDoctorAvailableOnDay(dayOfWeek, doctorConfig)) {
      const availableSlots = generateTimeSlotsForDay({
        date: dateString,
        doctorConfig,
        existingAppointments,
      });

      schedule.push({
        date: dateString,
        availableSlots,
        dayOfWeek,
        dayName: WEEK_DAYS[dayOfWeek],
      });

      console.log(
        `✅ ${dateString}: ${availableSlots.length} horários disponíveis`,
      );
    } else {
      console.log(`❌ ${dateString}: Médico não atende neste dia`);
    }

    // ✅ Avançar para o próximo dia
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log("🎯 Agenda gerada com", schedule.length, "dias de atendimento");
  return schedule;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Criar data de forma segura
 *
 * Cria um objeto Date a partir de string YYYY-MM-DD de forma que funcione
 * consistentemente tanto em ambiente local quanto em servidor UTC
 */
function createSafeDate(dateString: string): Date {
  // ✅ Extrair componentes da data de forma explícita
  const [year, month, day] = dateString.split("-").map(Number);

  // ✅ Criar Date usando construtor com componentes explícitos
  // Isso garante que a data seja criada no timezone local, não UTC
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  console.log(`🔧 Data criada: ${dateString} -> ${date.toISOString()}`);
  return date;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Obter dia da semana de forma segura
 *
 * Calcula o dia da semana de forma que seja consistente
 * independente do timezone do servidor
 */
function getSafeDayOfWeek(date: Date): number {
  // ✅ Usar getDay() após garantir que a data está no timezone correto
  const dayOfWeek = date.getDay();

  console.log(
    `🔧 Dia da semana calculado: ${date.toDateString()} = ${dayOfWeek} (${WEEK_DAYS[dayOfWeek]})`,
  );
  return dayOfWeek;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Formatar data para YYYY-MM-DD
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Verificar se médico atende no dia da semana
 *
 * Verifica se o dia da semana está dentro do range de atendimento do médico
 * Lida com casos especiais como "segunda a sexta" ou "terça a sábado"
 */
function isDoctorAvailableOnDay(
  dayOfWeek: number,
  doctorConfig: DoctorScheduleConfig,
): boolean {
  const { availableFromWeekDay, availableToWeekDay } = doctorConfig;

  // ✅ Caso simples: range não cruza a semana (ex: segunda=1 a sexta=5)
  if (availableFromWeekDay <= availableToWeekDay) {
    const isAvailable =
      dayOfWeek >= availableFromWeekDay && dayOfWeek <= availableToWeekDay;
    console.log(
      `🔍 Range simples: ${dayOfWeek} entre ${availableFromWeekDay}-${availableToWeekDay}? ${isAvailable}`,
    );
    return isAvailable;
  }

  // ✅ Caso especial: range cruza a semana (ex: sexta=5 a segunda=1)
  // Isso aconteceria se o médico atendesse sexta, sábado, domingo, segunda
  const isAvailable =
    dayOfWeek >= availableFromWeekDay || dayOfWeek <= availableToWeekDay;
  console.log(
    `🔍 Range cruzado: ${dayOfWeek} >= ${availableFromWeekDay} OU <= ${availableToWeekDay}? ${isAvailable}`,
  );
  return isAvailable;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Gerar slots de horário para um dia específico
 */
function generateTimeSlotsForDay({
  date,
  doctorConfig,
  existingAppointments,
}: {
  date: string;
  doctorConfig: DoctorScheduleConfig;
  existingAppointments: Array<{ date: string; time: string }>;
}): string[] {
  console.log(`🕐 Gerando horários para ${date}`);

  // ✅ Gerar todos os slots possíveis
  const allSlots = generateTimeSlots(
    doctorConfig.availableFromTime,
    doctorConfig.availableToTime,
    doctorConfig.intervalMinutes || 30,
  );

  // ✅ Filtrar horários já ocupados
  const occupiedSlots = existingAppointments
    .filter((apt) => apt.date === date)
    .map((apt) => apt.time);

  const availableSlots = allSlots.filter(
    (slot) => !occupiedSlots.includes(slot),
  );

  console.log(
    `🕐 ${date}: ${allSlots.length} total, ${occupiedSlots.length} ocupados, ${availableSlots.length} disponíveis`,
  );
  console.log(`🕐 Horários disponíveis: ${availableSlots.join(", ")}`);

  return availableSlots;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Gerar slots de tempo entre dois horários
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number,
): string[] {
  const slots: string[] = [];

  // ✅ Converter horários para minutos para facilitar cálculos
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  console.log(
    `🕐 Gerando slots de ${startTime} (${startMinutes}min) até ${endTime} (${endMinutes}min), intervalo ${intervalMinutes}min`,
  );

  // ✅ Gerar slots com intervalo especificado
  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += intervalMinutes
  ) {
    const timeSlot = minutesToTime(minutes);
    slots.push(timeSlot);
  }

  console.log(`🕐 Slots gerados: ${slots.join(", ")}`);
  return slots;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Converter tempo HH:mm para minutos
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * 🔧 FUNÇÃO AUXILIAR: Converter minutos para tempo HH:mm
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// ✅ EXEMPLO DE USO
export function exemploDeUso() {
  const doctorConfig: DoctorScheduleConfig = {
    doctorId: "dr-joao",
    availableFromWeekDay: 1, // Segunda-feira
    availableToWeekDay: 5, // Sexta-feira
    availableFromTime: "08:00",
    availableToTime: "18:00",
    intervalMinutes: 30,
  };

  const existingAppointments = [
    { date: "2025-09-01", time: "09:00" },
    { date: "2025-09-01", time: "14:30" },
    { date: "2025-09-02", time: "10:00" },
  ];

  const schedule = generateDoctorSchedule({
    doctorConfig,
    startDate: "2025-09-01", // Segunda
    endDate: "2025-09-07", // Domingo
    existingAppointments,
  });

  console.log("📋 AGENDA GERADA:");
  schedule.forEach((day) => {
    console.log(
      `${day.date} (${day.dayName}): ${day.availableSlots.length} horários`,
    );
    console.log(`  Horários: ${day.availableSlots.join(", ")}`);
  });

  return schedule;
}

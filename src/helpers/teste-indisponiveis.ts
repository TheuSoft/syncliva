/**
 * 🧪 TESTE: Horários indisponíveis vs removidos
 *
 * Demonstra a diferença entre a nova funcionalidade e a antiga
 */

import { getAvailableTimesRobust } from "./solucao-final-agendamento";

console.log("🧪 TESTE: Horários ocupados agora aparecem como indisponíveis\n");

// Médico que atende das 8:00 às 12:00
const doctor = {
  id: "dr-teste",
  availableFromWeekDay: 1, // Segunda
  availableToWeekDay: 5, // Sexta
  availableFromTime: "08:00:00",
  availableToTime: "12:00:00",
};

// Simular alguns agendamentos existentes
const existingAppointments = [
  { date: new Date("2025-09-01T09:00:00") }, // 09:00 ocupado
  { date: new Date("2025-09-01T11:00:00") }, // 11:00 ocupado
];

console.log("📅 Testando segunda-feira (2025-09-01) das 08:00 às 12:00");
console.log("🚫 Agendamentos existentes: 09:00, 11:00\n");

const result = getAvailableTimesRobust(
  doctor,
  "2025-09-01",
  existingAppointments,
  60, // 60 minutos
);

console.log("📊 RESULTADO COMPLETO:");
result.forEach((slot) => {
  const status = slot.available ? "✅ DISPONÍVEL" : "❌ OCUPADO";
  console.log(`   ${slot.value}: ${status}`);
});

console.log(`\n📈 RESUMO:`);
console.log(`   Total de horários: ${result.length}`);
console.log(`   Disponíveis: ${result.filter((s) => s.available).length}`);
console.log(`   Ocupados: ${result.filter((s) => !s.available).length}`);

console.log("\n🎯 VANTAGENS DA NOVA ABORDAGEM:");
console.log("✅ Usuário vê todos os horários possíveis");
console.log("✅ Horários ocupados ficam visíveis mas indisponíveis");
console.log("✅ Interface mais informativa");
console.log("✅ Melhor experiência do usuário");

export { doctor, existingAppointments };

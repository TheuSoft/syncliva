/**
 * 🧪 TESTE: Verificar inclusão do último horário
 */

import { getAvailableTimesRobust } from "./solucao-final-agendamento";

console.log("🧪 TESTE: Último horário sendo incluído\n");

// Médico que atende das 8:00 às 18:00
const doctorTest = {
  id: "dr-teste",
  availableFromWeekDay: 1, // Segunda
  availableToWeekDay: 5, // Sexta
  availableFromTime: "08:00:00",
  availableToTime: "18:00:00",
};

console.log("📅 Testando médico das 08:00 às 18:00:");
const slots8to18 = getAvailableTimesRobust(
  doctorTest,
  "2025-09-01", // Segunda-feira
  [],
  60, // 60 minutos
);

console.log(
  `✅ Horários gerados: ${slots8to18.map((s) => s.value).join(", ")}`,
);
console.log(`📊 Total: ${slots8to18.length} horários`);

// Verificar se 18:00 está incluído
const has18 = slots8to18.some((slot) => slot.value === "18:00");
console.log(`🎯 Inclui 18:00? ${has18 ? "✅ SIM" : "❌ NÃO"}`);

console.log("\n📅 Testando médico das 07:00 às 20:00:");

// Médico que atende das 7:00 às 20:00 (como sistema original)
const doctorTest2 = {
  id: "dr-teste2",
  availableFromWeekDay: 1,
  availableToWeekDay: 5,
  availableFromTime: "07:00:00",
  availableToTime: "20:00:00",
};

const slots7to20 = getAvailableTimesRobust(doctorTest2, "2025-09-01", [], 60);

console.log(
  `✅ Horários gerados: ${slots7to20.map((s) => s.value).join(", ")}`,
);
console.log(`📊 Total: ${slots7to20.length} horários`);

// Verificar se 20:00 está incluído
const has20 = slots7to20.some((slot) => slot.value === "20:00");
console.log(`🎯 Inclui 20:00? ${has20 ? "✅ SIM" : "❌ NÃO"}`);

console.log("\n🎯 RESULTADO:");
if (has18 && has20) {
  console.log("✅ CORREÇÃO APLICADA COM SUCESSO!");
  console.log("✅ Último horário agora está sendo incluído!");
} else {
  console.log("❌ Ainda há problema com último horário");
}

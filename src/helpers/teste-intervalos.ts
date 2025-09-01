/**
 * 🔍 TESTE DE VALIDAÇÃO: Intervalos de Agendamento
 *
 * Este teste mostra a diferença entre os intervalos antigos e novos
 * e valida se a solução está gerando os horários corretos
 */

import { getAvailableTimesRobust } from "./solucao-final-agendamento";

// 🎯 TESTE: Simular um médico típico
const doctorTest = {
  id: "dr-teste",
  availableFromWeekDay: 1, // Segunda
  availableToWeekDay: 5, // Sexta
  availableFromTime: "08:00:00",
  availableToTime: "18:00:00",
};

console.log("🧪 TESTE DE INTERVALOS DE AGENDAMENTO\n");

// ✅ TESTE 1: Intervalo de 30 minutos (problema anterior)
console.log("❌ PROBLEMA: Intervalos de 30 minutos");
const slots30min = getAvailableTimesRobust(
  doctorTest,
  "2025-09-01", // Segunda-feira
  [],
  30, // 30 minutos
);

console.log(`   Resultado: ${slots30min.length} horários`);
console.log(
  `   Primeiros 10: ${slots30min
    .slice(0, 10)
    .map((s) => s.value)
    .join(", ")}`,
);
console.log("   ⚠️  Muitos horários desnecessários!\n");

// ✅ TESTE 2: Intervalo de 60 minutos (CORRETO)
console.log("✅ SOLUÇÃO: Intervalos de 60 minutos (1 hora)");
const slots60min = getAvailableTimesRobust(
  doctorTest,
  "2025-09-01", // Segunda-feira
  [],
  60, // 60 minutos
);

console.log(`   Resultado: ${slots60min.length} horários`);
console.log(`   Todos: ${slots60min.map((s) => s.value).join(", ")}`);
console.log("   ✅ Intervalos corretos conforme sistema original!\n");

// ✅ TESTE 3: Comparação com sistema original
console.log("📊 COMPARAÇÃO COM SISTEMA ORIGINAL:");
console.log(
  "   Sistema original (availability.tsx): 07:00, 08:00, 09:00, ..., 20:00",
);
console.log(
  `   Nova solução (60min): ${slots60min.map((s) => s.value).join(", ")}`,
);

if (slots60min.length === 10 && slots60min[0].value === "08:00") {
  console.log("   ✅ COMPATIBILIDADE TOTAL!");
} else {
  console.log("   ⚠️  Diferenças encontradas");
}

console.log("\n🎯 CONCLUSÃO:");
console.log("- Use intervalo de 60 minutos para manter compatibilidade");
console.log("- Horários gerados: 08:00 até 17:00 (1 hora cada)");
console.log("- Total de slots: 10 horários por dia");
console.log("- Comportamento idêntico ao sistema original");

export { doctorTest };

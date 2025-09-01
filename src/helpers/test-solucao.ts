/**
 * 🧪 TESTE DEFINITIVO DA SOLUÇÃO
 * Execute: npm run test ou node -r ts-node/register test-solucao.ts
 */

import {
  exemploCompleto,
  getAvailableTimesRobust,
  testarProblemaSegundas,
} from "./solucao-final-agendamento";

// 🎯 TESTE 1: Reproduzir o problema exato
function testarProblemaOriginal() {
  console.log("🔍 REPRODUZINDO O PROBLEMA ORIGINAL\n");

  // Cenário: Médico que atende segunda a sexta
  const doctor = {
    id: "dr-problema",
    availableFromWeekDay: 1, // Segunda
    availableToWeekDay: 5, // Sexta
    availableFromTime: "08:00",
    availableToTime: "18:00",
  };

  // Datas que apresentavam problema no deploy
  const datasProblematicas = [
    "2025-01-06", // Segunda
    "2025-01-07", // Terça
    "2025-01-08", // Quarta
    "2025-01-09", // Quinta
    "2025-01-10", // Sexta
  ];

  console.log("📊 RESULTADOS:");
  datasProblematicas.forEach((data) => {
    const slots = getAvailableTimesRobust(doctor, data, []);
    const status = slots.length > 0 ? "✅" : "❌";
    console.log(`${status} ${data}: ${slots.length} horários disponíveis`);
  });
}

// 🎯 TESTE 2: Casos extremos
function testarCasosExtremos() {
  console.log("\n🔬 TESTANDO CASOS EXTREMOS\n");

  // Caso 1: Médico que trabalha fim de semana
  const doctorFimSemana = {
    id: "dr-weekend",
    availableFromWeekDay: 6, // Sábado
    availableToWeekDay: 0, // Domingo (cruza semana)
    availableFromTime: "09:00",
    availableToTime: "17:00",
  };

  console.log("👨‍⚕️ Médico fim de semana (Sáb-Dom):");
  ["2025-01-04", "2025-01-05", "2025-01-06"].forEach((data) => {
    const slots = getAvailableTimesRobust(doctorFimSemana, data, []);
    console.log(`   ${data}: ${slots.length} horários`);
  });

  // Caso 2: Médico que trabalha só um dia
  const doctorUmDia = {
    id: "dr-um-dia",
    availableFromWeekDay: 3, // Quarta
    availableToWeekDay: 3, // Quarta
    availableFromTime: "14:00",
    availableToTime: "18:00",
  };

  console.log("\n👨‍⚕️ Médico um dia só (Quarta):");
  ["2025-01-07", "2025-01-08", "2025-01-09"].forEach((data) => {
    const slots = getAvailableTimesRobust(doctorUmDia, data, []);
    console.log(`   ${data}: ${slots.length} horários`);
  });
}

// 🎯 TESTE 3: Agendamentos ocupados
function testarAgendamentosOcupados() {
  console.log("\n📋 TESTANDO AGENDAMENTOS OCUPADOS\n");

  const doctor = {
    id: "dr-ocupado",
    availableFromWeekDay: 1,
    availableToWeekDay: 5,
    availableFromTime: "08:00",
    availableToTime: "12:00",
  };

  const agendamentosExistentes = [
    { date: new Date("2025-01-06T09:00:00") }, // Segunda 09:00
    { date: new Date("2025-01-06T10:30:00") }, // Segunda 10:30
    { date: new Date("2025-01-07T08:00:00") }, // Terça 08:00
  ];

  // Testar segunda-feira (com agendamentos)
  const slotsSegunda = getAvailableTimesRobust(
    doctor,
    "2025-01-06",
    agendamentosExistentes,
  );
  console.log(
    `Segunda (com agendamentos): ${slotsSegunda.length} horários livres`,
  );
  console.log(
    `Horários: ${slotsSegunda
      .slice(0, 5)
      .map((s) => s.value)
      .join(", ")}`,
  );

  // Testar terça-feira (com agendamentos)
  const slotsTerca = getAvailableTimesRobust(
    doctor,
    "2025-01-07",
    agendamentosExistentes,
  );
  console.log(`Terça (com agendamentos): ${slotsTerca.length} horários livres`);

  // Testar quarta-feira (sem agendamentos)
  const slotsQuarta = getAvailableTimesRobust(
    doctor,
    "2025-01-08",
    agendamentosExistentes,
  );
  console.log(
    `Quarta (sem agendamentos): ${slotsQuarta.length} horários livres`,
  );
}

// 🎯 TESTE PRINCIPAL
function executarTodosOsTestes() {
  console.log("🚀 INICIANDO BATERIA COMPLETA DE TESTES\n");
  console.log("=".repeat(60));

  testarProblemaOriginal();
  testarCasosExtremos();
  testarAgendamentosOcupados();

  console.log("\n" + "=".repeat(60));
  console.log("🧪 TESTES ESPECÍFICOS DO ALGORITMO\n");

  exemploCompleto();
  testarProblemaSegundas();

  console.log("\n" + "=".repeat(60));
  console.log("✅ TODOS OS TESTES CONCLUÍDOS!");
  console.log(
    "📝 Se todos os testes passaram, a solução está pronta para produção.",
  );
}

// 🎯 Executar se chamado diretamente
if (require.main === module) {
  executarTodosOsTestes();
}

export {
  executarTodosOsTestes,
  testarAgendamentosOcupados,
  testarCasosExtremos,
  testarProblemaOriginal,
};

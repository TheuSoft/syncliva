import { and, eq, gte, lte, ne } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import type { AppointmentWithRelations } from "@/types/appointments";

export type RelatorioFiltro = {
  doctorId?: string;
  mes: number; // 1-12
  ano: number;
};

/**
 * Busca agendamentos filtrados por mês, ano e opcionalmente por doutor
 * Inclui apenas agendamentos confirmados e pendentes (exclui cancelados)
 * Ordena por data crescente
 */
export async function buscarRelatorioConsultas(
  clinicId: string,
  filtro: RelatorioFiltro
): Promise<AppointmentWithRelations[]> {
  // Primeiro e último dia do mês
  const primeiroDia = new Date(filtro.ano, filtro.mes - 1, 1, 0, 0, 0);
  const ultimoDia = new Date(filtro.ano, filtro.mes, 0, 23, 59, 59);

  // Monta filtro (excluindo agendamentos cancelados)
  const where = and(
    eq(appointmentsTable.clinicId, clinicId),
    filtro.doctorId ? eq(appointmentsTable.doctorId, filtro.doctorId) : undefined,
    gte(appointmentsTable.date, primeiroDia),
    lte(appointmentsTable.date, ultimoDia),
    ne(appointmentsTable.status, "canceled") // ✅ Excluir agendamentos cancelados
  );

  // Busca agendamentos
  const agendamentos = await db.query.appointmentsTable.findMany({
    where,
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  return agendamentos as AppointmentWithRelations[];
}

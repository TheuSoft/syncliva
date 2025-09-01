import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

export interface DashboardData {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  topDoctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
  }[];
  topSpecialties: {
    specialty: string;
    appointments: number;
  }[];
  todayAppointments: (typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
    updatedAt: Date;
  })[];
  dailyAppointmentsData: {
    date: string;
    appointments: number;
    revenue: number | null;
  }[];
}

/**
 * Busca todos os dados necessários para o dashboard
 * @param clinicId - ID da clínica
 * @param from - Data de início (YYYY-MM-DD)
 * @param to - Data de fim (YYYY-MM-DD)
 * @returns Dados completos do dashboard
 */
export async function getDashboardData(
  clinicId: string,
  from: string,
  to: string,
): Promise<DashboardData> {
  // ✅ Filtro para status: apenas 'pending' e 'confirmed'
  const statusFilter = sql`${appointmentsTable.status} IN ('pending', 'confirmed')`;
  const dateFilter = and(
    gte(appointmentsTable.date, new Date(from)),
    lte(appointmentsTable.date, new Date(to)),
  );

  const [
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsDataRaw,
  ] = await Promise.all([
    // ✅ Receita total (apenas agendamentos pendentes e confirmados)
    db
      .select({ total: sum(appointmentsTable.appointmentPriceInCents) })
      .from(appointmentsTable)
      .where(
        and(eq(appointmentsTable.clinicId, clinicId), dateFilter, statusFilter),
      ),

    // ✅ Total de agendamentos (apenas pendentes e confirmados)
    db
      .select({ total: count() })
      .from(appointmentsTable)
      .where(
        and(eq(appointmentsTable.clinicId, clinicId), dateFilter, statusFilter),
      ),

    // ✅ Total de pacientes únicos (baseado em agendamentos ativos)
    db
      .selectDistinct({ patientId: appointmentsTable.patientId })
      .from(appointmentsTable)
      .where(
        and(eq(appointmentsTable.clinicId, clinicId), dateFilter, statusFilter),
      )
      .then((result) => ({ total: result.length })),

    // Total de médicos (não precisa de filtro por status)
    db
      .select({ total: count() })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinicId)),

    // ✅ Top médicos com campos corretos e filtro por status
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(doctorsTable.id, appointmentsTable.doctorId),
          dateFilter,
          statusFilter,
        ),
      )
      .where(eq(doctorsTable.clinicId, clinicId))
      .groupBy(
        doctorsTable.id,
        doctorsTable.name,
        doctorsTable.avatarImageUrl,
        doctorsTable.specialty,
      )
      .orderBy(sql`count(${appointmentsTable.id}) desc`)
      .limit(5),

    // ✅ Top especialidades com nome correto e filtro por status
    db
      .select({
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(doctorsTable.id, appointmentsTable.doctorId),
          dateFilter,
          statusFilter,
        ),
      )
      .where(eq(doctorsTable.clinicId, clinicId))
      .groupBy(doctorsTable.specialty)
      .orderBy(sql`count(${appointmentsTable.id}) desc`)
      .limit(5),

    // ✅ Agendamentos de hoje (apenas pendentes e confirmados)
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, clinicId),
        gte(
          appointmentsTable.date,
          new Date(dayjs().startOf("day").toISOString()),
        ),
        lte(
          appointmentsTable.date,
          new Date(dayjs().endOf("day").toISOString()),
        ),
        statusFilter,
      ),
      with: { patient: true, doctor: true },
      orderBy: (appointments, { asc }) => [asc(appointments.date)],
    }),

    // ✅ Dados do gráfico (apenas pendentes e confirmados)
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`,
        appointments: count(appointmentsTable.id),
        revenue: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(eq(appointmentsTable.clinicId, clinicId), dateFilter, statusFilter),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
  ]);

  // ✅ Converter revenue de string para number (correção de tipo)
  const dailyAppointmentsData = dailyAppointmentsDataRaw.map((item) => ({
    date: item.date,
    appointments: item.appointments,
    revenue: item.revenue ? Number(item.revenue) : null,
  }));

  return {
    totalRevenue: totalRevenue[0]?.total ? Number(totalRevenue[0].total) : null,
    totalAppointments: totalAppointments[0]?.total || 0,
    totalPatients: totalPatients?.total || 0,
    totalDoctors: totalDoctors[0]?.total || 0,
    topDoctors,
    topSpecialties,
    todayAppointments: todayAppointments.map((appointment) => ({
      ...appointment,
      updatedAt: appointment.updatedAt ?? new Date(),
    })),
    dailyAppointmentsData,
  };
}

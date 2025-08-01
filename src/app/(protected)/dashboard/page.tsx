import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema"; // ✅ Removido patientsTable
import { auth } from "@/lib/auth";

import { appointmentsTableColumns } from "../appointments/_components/table-columns";
import AppointmentsChart from "./_components/appointments-chart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopDoctors from "./_components/top-doctors";
import TopSpecialties from "./_components/top-specialties";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const { from, to } = await searchParams;

  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const clinicId = session.user.clinic.id;

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
        avatarImageUrl: doctorsTable.avatarImageUrl, // ✅ Campo necessário
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id), // ✅ Nome correto
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(doctorsTable.id, appointmentsTable.doctorId),
          dateFilter,
          statusFilter, // ✅ Filtro aplicado
        ),
      )
      .where(eq(doctorsTable.clinicId, clinicId))
      .groupBy(
        doctorsTable.id,
        doctorsTable.name,
        doctorsTable.avatarImageUrl, // ✅ Incluído no GROUP BY
        doctorsTable.specialty,
      )
      .orderBy(sql`count(${appointmentsTable.id}) desc`)
      .limit(5),

    // ✅ Top especialidades com nome correto e filtro por status
    db
      .select({
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id), // ✅ Nome correto (não appointmentCount)
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(doctorsTable.id, appointmentsTable.doctorId),
          dateFilter,
          statusFilter, // ✅ Filtro aplicado
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
        statusFilter, // ✅ Filtro aplicado
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

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={
            totalRevenue[0]?.total ? Number(totalRevenue[0].total) : null
          }
          totalAppointments={totalAppointments[0]?.total || 0}
          totalPatients={totalPatients?.total || 0}
          totalDoctors={totalDoctors[0]?.total || 0}
        />
        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
          <TopDoctors doctors={topDoctors} />
        </div>
        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground" />
                <CardTitle className="text-base">
                  Agendamentos de hoje
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={appointmentsTableColumns}
                data={todayAppointments.map((appointment) => ({
                  ...appointment,
                  updatedAt: appointment.updatedAt ?? new Date(),
                }))}
              />
            </CardContent>
          </Card>
          <TopSpecialties topSpecialties={topSpecialties} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

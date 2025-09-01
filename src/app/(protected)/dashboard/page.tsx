import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDashboardData } from "@/actions/clinica/get-dashboard-data";
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
import { auth } from "@/lib/auth";

import AppointmentsChart from "./_components/appointments-chart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import { columns as todayAppointmentsColumns } from "./_components/today-appointments-columns";
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

  // ✅ Usar server action para buscar todos os dados do dashboard
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  } = await getDashboardData(clinicId, from, to);

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
          totalRevenue={totalRevenue}
          totalAppointments={totalAppointments}
          totalPatients={totalPatients}
          totalDoctors={totalDoctors}
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
          <div className="space-y-6">
            <TopDoctors doctors={topDoctors} />
            <TopSpecialties topSpecialties={topSpecialties} />
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground" />
              <CardTitle className="text-base">Agendamentos de hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={todayAppointmentsColumns}
              data={todayAppointments}
            />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

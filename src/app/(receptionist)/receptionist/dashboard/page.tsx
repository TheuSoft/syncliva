import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import DashboardStats from "./_components/dashboard-stats";
import RecentActivities from "./_components/recent-activities";
import UpcomingAppointments from "./_components/upcoming-appointments";

export default async function ReceptionistDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {session.user.name}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema de gestão da clínica {session.user.clinic?.name}
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivities />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingAppointments />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

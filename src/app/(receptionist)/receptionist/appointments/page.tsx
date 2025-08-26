import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

import AppointmentsList from "./_components/appointments-list";
import CreateAppointmentButton from "./_components/create-appointment-button";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 🔐 Redirecionamentos de segurança
  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // ✅ Apenas recepcionistas podem acessar esta página
  if (session.user.role !== "receptionist") {
    redirect("/receptionist/dashboard");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <CreateAppointmentButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <AppointmentsList />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;

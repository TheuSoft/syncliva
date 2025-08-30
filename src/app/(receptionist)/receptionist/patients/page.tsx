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

import CreatePatientButton from "./_components/create-patient-button";
import PatientsList from "./_components/patients-list";

const PatientsPage = async () => {
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
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <CreatePatientButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <PatientsList />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;

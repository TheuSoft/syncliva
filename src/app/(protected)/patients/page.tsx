import { eq } from "drizzle-orm";
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
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import SearchablePatientsList from "./_components/searchable-patients-list";
import { patientsTableColumns } from "./_components/table-columns";

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

  // ✅ Buscar pacientes da clínica do usuário
  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
  });

  const hasPatients = patients.length > 0;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          {/* 🚫 CORRIGIDO: aspas escapadas para evitar erro ESLint */}
          <PageDescription>
            Gerencie os pacientes da sua clínica. Clique no botão
            &quot;Adicionar paciente&quot; para cadastrar um novo.
          </PageDescription>
        </PageHeaderContent>

        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        {/* ✅ Mostrar tabela se houver pacientes */}
        {hasPatients ? (
          <SearchablePatientsList
            initialPatients={patients}
            columns={patientsTableColumns}
          />
        ) : (
          <div className="text-muted-foreground rounded border p-4 text-sm">
            Nenhum paciente cadastrado. Clique em &quot;Adicionar paciente&quot;
            para começar.
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;

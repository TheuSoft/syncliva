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
          <div className="from-background to-muted/20 border-border/40 rounded-lg border bg-gradient-to-br p-8 text-center shadow-sm">
            <div className="bg-muted/30 border-border/30 mx-auto mb-4 w-fit rounded-xl border p-3">
              <svg
                className="text-muted-foreground h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Nenhum paciente cadastrado
            </h3>
            <p className="text-muted-foreground">
              Clique em &quot;Adicionar paciente&quot; para começar.
            </p>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;

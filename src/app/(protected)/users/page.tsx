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

import AddUserButton from "./_components/add-user-button";
import UsersTabs from "./_components/users-tabs";

const UsersPage = async () => {
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

  // ✅ Apenas admins podem acessar esta página
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gerenciamento de Usuários</PageTitle>
          <PageDescription>
            Gerencie administradores e recepcionistas da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddUserButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <UsersTabs />
      </PageContent>
    </PageContainer>
  );
};

export default UsersPage;

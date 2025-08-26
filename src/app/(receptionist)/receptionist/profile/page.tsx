import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import ProfileForm from "./_components/profile-form";

const ProfilePage = async () => {
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
          <PageTitle>Perfil</PageTitle>
          <PageDescription>
            Gerencie suas informações pessoais
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <ProfileForm />
      </PageContent>
    </PageContainer>
  );
};

export default ProfilePage;

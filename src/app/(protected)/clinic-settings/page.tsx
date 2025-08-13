import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

export default async function ClinicSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações da Clínica
          </h1>
          <p className="text-muted-foreground">
            Gerencie as informações e configurações da sua clínica
          </p>
        </div>

        <div className="grid gap-6">
          {/* Informações da Clínica */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
              <CardDescription>
                Visualize e edite as informações básicas da clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Nome da Clínica
                  </label>
                  <p className="text-base font-medium">
                    {session.user.clinic.name}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Email do Administrador
                  </label>
                  <p className="text-base">{session.user.email}</p>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="/clinic-settings/edit"
                  className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Editar Informações
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configurações gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    ID da Clínica
                  </label>
                  <p className="font-mono text-xs">{session.user.clinic.id}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Status
                  </label>
                  <p className="text-base font-medium text-green-600">Ativa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configurações de segurança e acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Último Acesso
                </label>
                <p className="text-base">
                  {new Date().toLocaleDateString("pt-BR")} às{" "}
                  {new Date().toLocaleTimeString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

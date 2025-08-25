import { CalendarIcon, FileTextIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

export default function DoctorDashboard() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard do Médico</PageTitle>
          <PageDescription>
            Bem-vindo! Acesse suas funcionalidades principais
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card Agendamentos */}
          <Link href="/doctor/appointments">
            <Card className="border-border/40 cursor-pointer border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Meus Agendamentos
                  </CardTitle>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground text-2xl font-bold">
                  Consultas
                </div>
                <p className="text-muted-foreground text-xs">
                  Visualize e gerencie suas consultas
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card Relatórios */}
          <Link href="/doctor/reports">
            <Card className="border-border/40 cursor-pointer border bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Relatórios
                  </CardTitle>
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2">
                    <FileTextIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground text-2xl font-bold">
                  Faturamento
                </div>
                <p className="text-muted-foreground text-xs">
                  Analise suas consultas e ganhos
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card Perfil */}
          <Link href="/doctor/profile">
            <Card className="border-border/40 cursor-pointer border bg-gradient-to-br from-purple-500/10 to-violet-500/5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Meu Perfil
                  </CardTitle>
                  <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2">
                    <UserIcon className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-foreground text-2xl font-bold">Dados</div>
                <p className="text-muted-foreground text-xs">
                  Visualize suas informações
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </PageContent>
    </PageContainer>
  );
}

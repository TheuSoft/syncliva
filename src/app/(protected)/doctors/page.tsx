import { eq } from "drizzle-orm";
import { Stethoscope, UserCheck, Users, UserX } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });

  // Calcular estatísticas
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(
    (doctor) => !!doctor.registeredAt,
  ).length;
  const invitedDoctors = doctors.filter(
    (doctor) => !!doctor.inviteToken && !doctor.registeredAt,
  ).length;
  const pendingDoctors = doctors.filter(
    (doctor) => !doctor.inviteToken && !doctor.registeredAt,
  ).length;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>
            Gerencie os médicos cadastrados no sistema da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        {/* Estatísticas */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Médicos
              </CardTitle>
              <Users className="text-primary h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDoctors}</div>
              <p className="text-muted-foreground text-xs">
                Médicos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Médicos Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {activeDoctors}
              </div>
              <p className="text-muted-foreground text-xs">
                Já registrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convidados</CardTitle>
              <Stethoscope className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {invitedDoctors}
              </div>
              <p className="text-muted-foreground text-xs">
                Aguardando registro
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <UserX className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-2xl font-bold">
                {pendingDoctors}
              </div>
              <p className="text-muted-foreground text-xs">
                Sem convite enviado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de médicos */}
        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="from-muted/20 to-muted/10 mb-4 rounded-full bg-gradient-to-br p-6">
                <Stethoscope className="text-muted-foreground h-12 w-12" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Nenhum médico cadastrado
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Comece adicionando o primeiro médico ao sistema da sua clínica
                para gerenciar consultas e agendamentos.
              </p>
              <AddDoctorButton />
            </CardContent>
          </Card>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;

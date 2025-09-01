import { headers } from "next/headers";

import { getDoctorAppointments } from "@/actions/medicos/get-doctor-appointments";
import { SearchableAppointmentsList } from "@/app/(protected)/appointments/_components/searchable-appointments-list";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import type { AppointmentWithRelations } from "@/types/appointments";

// Forçar renderização dinâmica devido ao uso de headers()
export const dynamic = "force-dynamic";

// Removido funções não utilizadas

export default async function DoctorAppointments() {
  // Obter a sessão do médico (já validada no layout)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session.user.doctorId) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Pacientes Marcados</PageTitle>
            <PageDescription>
              Visualize e gerencie seus pacientes agendados
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>

        <PageContent>
          <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-destructive/10 border-destructive/20 mx-auto mb-4 w-fit rounded-xl border p-3">
                <svg
                  className="text-destructive h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Erro: Médico não encontrado
              </h3>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    );
  }

  const result = await getDoctorAppointments(session.user.doctorId);

  if (!result.success) {
    return (
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Pacientes Marcados</PageTitle>
            <PageDescription>
              Visualize e gerencie seus pacientes agendados
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>

        <PageContent>
          <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-destructive/10 border-destructive/20 mx-auto mb-4 w-fit rounded-xl border p-3">
                <svg
                  className="text-destructive h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Erro: {result.error}
              </h3>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    );
  }

  const appointments = result.appointments;
  // const doctorId =
  //   appointments.length > 0 ? appointments[0].doctor.id : undefined;

  // Extrair pacientes e médicos para o modal de edição
  const patients = appointments.map((app) => ({
    id: app.patient.id,
    name: app.patient.name,
    email: app.patient.email,
    phoneNumber: app.patient.phoneNumber,
    sex: app.patient.sex,
  }));

  const doctors = appointments.map((app) => ({
    id: app.doctor.id,
    name: app.doctor.name,
    specialty: app.doctor.specialty,
    appointmentPriceInCents: app.appointmentPriceInCents,
    availableFromWeekDay: 0, // Valor padrão
    availableToWeekDay: 6, // Valor padrão
  }));

  // Converter o formato do resultado para o formato esperado por AppointmentWithRelations
  const appointmentsFormatted: AppointmentWithRelations[] = appointments.map(
    (app) => ({
      ...app,
      clinicId: "", // Adicionar propriedades necessárias que estão ausentes no resultado da API
      patientId: app.patient.id,
      doctorId: app.doctor.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Garantir que doctor tenha todas as propriedades necessárias
      doctor: {
        ...app.doctor,
        appointmentPriceInCents: app.appointmentPriceInCents, // Usar o valor do agendamento como fallback
      },
    }),
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes Marcados</PageTitle>
          <PageDescription>
            Visualize e gerencie seus pacientes agendados ({appointments.length}{" "}
            agendamento{appointments.length !== 1 ? "s" : ""})
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        {/* Usar o componente SearchableAppointmentsList com isDoctor=true */}
        <SearchableAppointmentsList
          initialAppointments={appointmentsFormatted}
          patients={patients}
          doctors={doctors}
          isDoctor={true}
        />

        {appointments.length === 0 && (
          <Card className="from-background to-muted/20 border-border/40 border bg-gradient-to-br shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
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
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h8m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Nenhum agendamento encontrado
              </h3>
              <p className="text-muted-foreground text-center">
                Seus pacientes marcados aparecerão aqui quando houver
                agendamentos
              </p>
            </CardContent>
          </Card>
        )}
      </PageContent>
    </PageContainer>
  );
}

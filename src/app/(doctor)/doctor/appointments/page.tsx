import { headers } from "next/headers";

import { getDoctorAppointments } from "@/actions/get-doctor-appointments";
import SearchableAppointmentsList from "@/app/(protected)/appointments/_components/searchable-appointments-list";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pacientes Marcados
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie seus pacientes agendados
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500">Erro: Médico não encontrado</p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const result = await getDoctorAppointments(session.user.doctorId);

  if (!result.success) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pacientes Marcados
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie seus pacientes agendados
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500">Erro: {result.error}</p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const appointments = result.appointments;
  const doctorId =
    appointments.length > 0 ? appointments[0].doctor.id : undefined;

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pacientes Marcados
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie seus pacientes agendados ({appointments.length}{" "}
            agendamento{appointments.length !== 1 ? "s" : ""})
          </p>
        </div>

        {/* Usar o componente SearchableAppointmentsList com isDoctor=true */}
        <SearchableAppointmentsList
          initialAppointments={appointmentsFormatted}
          patients={patients}
          doctors={doctors}
          doctorId={doctorId}
          isDoctor={true}
        />

        {appointments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                Nenhum agendamento encontrado
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Seus pacientes marcados aparecerão aqui quando houver
                agendamentos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

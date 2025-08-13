import { headers } from "next/headers";

import { getDoctorAppointments } from "@/actions/get-doctor-appointments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { formatCurrencyInCents } from "@/helpers/currency";
import { auth } from "@/lib/auth";

// Forçar renderização dinâmica devido ao uso de headers()
export const dynamic = "force-dynamic";

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "confirmed":
      return "Agendamento pago";
    case "pending":
      return "Pendente";
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
}

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

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {appointment.patient.name}
                      </h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {appointment.patient.email} •{" "}
                      {appointment.patient.phoneNumber}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Valor:{" "}
                      {formatCurrencyInCents(
                        appointment.appointmentPriceInCents,
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(appointment.date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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

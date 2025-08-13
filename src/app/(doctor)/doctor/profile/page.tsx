import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { auth } from "@/lib/auth";

// Forçar renderização dinâmica devido ao uso de headers()
export const dynamic = "force-dynamic";

export default async function DoctorProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !session.user.doctorId) {
    return <div>Erro: Usuário não autenticado ou não é um médico</div>;
  }

  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.id, session.user.doctorId),
    with: {
      clinic: true,
    },
  });

  if (!doctor) {
    return <div>Erro: Informações do médico não encontradas</div>;
  }

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const weekDays = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Visualize suas informações profissionais
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {doctorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{doctor.name}</h3>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                  <p className="text-muted-foreground text-sm">
                    {doctor.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{doctor.clinic?.name}</p>
                <p className="text-muted-foreground text-sm">
                  Valor da consulta:{" "}
                  {formatCurrencyInCents(doctor.appointmentPriceInCents)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horários de Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Dias da semana:</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">
                      {weekDays[doctor.availableFromWeekDay]}
                    </Badge>
                    <span>até</span>
                    <Badge variant="outline">
                      {weekDays[doctor.availableToWeekDay]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Horários:</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{doctor.availableFromTime}</Badge>
                    <span>às</span>
                    <Badge variant="outline">{doctor.availableToTime}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  {doctor.registeredAt ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Pendente</Badge>
                  )}
                </div>

                {doctor.registeredAt && (
                  <p className="text-muted-foreground text-sm">
                    Registrado em:{" "}
                    {new Date(doctor.registeredAt).toLocaleDateString("pt-BR")}
                  </p>
                )}

                <p className="text-muted-foreground text-sm">
                  Cadastrado em:{" "}
                  {new Date(doctor.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

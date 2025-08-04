"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { buscarRelatorioConsultas, RelatorioFiltro } from "@/app/(protected)/reports/relatorio";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getDoctorReportsAction(filtro: RelatorioFiltro) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (session.user.role !== "doctor") {
    throw new Error("Usuário não é um médico");
  }

  if (!session?.user?.clinic?.id) {
    throw new Error("Usuário não vinculado a uma clínica.");
  }

  if (!session?.user?.doctorId) {
    throw new Error("Usuário não vinculado a um médico.");
  }

  // Verificar se o médico existe e pertence à clínica
  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.id, session.user.doctorId),
  });

  if (!doctor || doctor.clinicId !== session.user.clinic.id) {
    throw new Error("Médico não encontrado ou não pertence à clínica.");
  }

  // Forçar o filtro para incluir apenas consultas deste médico
  const filtroComMedico: RelatorioFiltro = {
    ...filtro,
    doctorId: session.user.doctorId,
  };

  return buscarRelatorioConsultas(session.user.clinic.id, filtroComMedico);
}

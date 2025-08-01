"use server";

import { headers } from "next/headers";

import { buscarRelatorioConsultas, RelatorioFiltro } from "@/app/(protected)/reports/relatorio";
import { auth } from "@/lib/auth";

export async function getRelatorioConsultasAction(filtro: RelatorioFiltro) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) {
    throw new Error("Usuário não vinculado a uma clínica.");
  }
  return buscarRelatorioConsultas(session.user.clinic.id, filtro);
}

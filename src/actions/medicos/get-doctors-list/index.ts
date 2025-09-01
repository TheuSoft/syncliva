"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function getDoctorsListAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic || !session.user.clinic.id) {
    throw new Error("Usuário não vinculado a uma clínica.");
  }
  return db.query.doctorsTable.findMany({
    where: (doctor, { eq }) => eq(doctor.clinicId, session.user.clinic!.id),
    columns: {
      id: true,
      name: true,
    },
    orderBy: (doctor, { asc }) => [asc(doctor.name)],
  });
}

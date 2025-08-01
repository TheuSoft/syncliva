import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.clinic) {
      return new NextResponse("Clinic not found", { status: 404 });
    }

    const patients = await db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("[PATIENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

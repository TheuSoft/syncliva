"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    // ✅ CORREÇÃO: Manter horários em formato local (Brasil) sem conversão UTC
    const availableFromTime = parsedInput.availableFromTime; // Ex: "08:00:00"
    const availableToTime = parsedInput.availableToTime; // Ex: "18:00:00"

    console.log("🎯 Saving doctor availability (local time):", {
      from: availableFromTime,
      to: availableToTime,
    });

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }
    await db
      .insert(doctorsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
        availableFromTime: availableFromTime, // ✅ Salvar como está (horário local)
        availableToTime: availableToTime, // ✅ Salvar como está (horário local)
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
          availableFromTime: availableFromTime, // ✅ Salvar como está (horário local)
          availableToTime: availableToTime, // ✅ Salvar como está (horário local)
        },
      });
    revalidatePath("/doctors");
  });

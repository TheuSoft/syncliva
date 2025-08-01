"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteDoctor = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    console.log("🗑️ Iniciando exclusão do médico:", parsedInput.id);
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    
    // Verificar se o médico existe e pertence à clínica do usuário
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.id),
    });
    
    if (!doctor) {
      throw new Error("Médico não encontrado");
    }
    
    if (doctor.clinicId !== session.user.clinic?.id) {
      throw new Error("Médico não encontrado");
    }
    
    console.log("✅ Médico encontrado:", doctor.name);
    
    try {
      // 1. Deletar todos os agendamentos do médico
      const deletedAppointments = await db
        .delete(appointmentsTable)
        .where(eq(appointmentsTable.doctorId, parsedInput.id))
        .returning();
      
      console.log(`🗑️ ${deletedAppointments.length} agendamentos deletados`);
      
      // 2. Deletar o usuário associado ao médico (se existir)
      const deletedUsers = await db
        .delete(usersTable)
        .where(eq(usersTable.doctorId, parsedInput.id))
        .returning();
      
      console.log(`🗑️ ${deletedUsers.length} usuários deletados`);
      
      // 3. Deletar o médico
      await db.delete(doctorsTable).where(eq(doctorsTable.id, parsedInput.id));
      
      console.log("✅ Médico deletado com sucesso");
      
      revalidatePath("/doctors");
      
      return { 
        success: true, 
        deletedAppointments: deletedAppointments.length,
        deletedUsers: deletedUsers.length 
      };
      
    } catch (error) {
      console.error("❌ Erro ao deletar médico:", error);
      throw new Error("Erro ao deletar médico");
    }
  });

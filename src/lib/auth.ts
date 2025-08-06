import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersToClinicsTable } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false, // Mudando para false já que suas tabelas estão no singular
    schema: {
      usersTable: schema.usersTable,
      accountsTable: schema.accountsTable,
      sessionsTable: schema.sessionsTable,
      verificationsTable: schema.verificationsTable, // Aqui está o mapeamento explícito
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const clinics = await db.query.usersToClinicsTable.findMany({
        where: eq(usersToClinicsTable.userId, user.id),
        with: {
          clinic: true,
        },
      });
      
      // Buscar informações completas do usuário incluindo role
      const fullUser = await db.query.usersTable.findFirst({
        where: eq(schema.usersTable.id, user.id),
      });

      const clinic = clinics?.[0];
      return {
        user: {
          ...user,
          role: fullUser?.role || "clinic_admin",
          doctorId: fullUser?.doctorId,
          clinic: clinic?.clinicId
            ? {
                id: clinic?.clinicId,
                name: clinic?.clinic?.name,
              }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
});

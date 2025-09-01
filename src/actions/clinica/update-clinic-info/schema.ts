import { z } from "zod";

export const updateClinicInfoSchema = z
  .object({
    name: z.string().optional(),
    adminEmail: z.string().email("Email inválido").optional(),
  })
  .refine((data) => data.name || data.adminEmail, {
    message: "Pelo menos um campo deve ser preenchido para atualização",
    path: ["root"],
  });

export type UpdateClinicInfoSchema = z.infer<typeof updateClinicInfoSchema>;

import { z } from "zod";

export const updateInviteEmailSchema = z.object({
  doctorId: z.string().uuid(),
  newEmail: z.string().email("Email inválido"),
});

export type UpdateInviteEmailSchema = z.infer<typeof updateInviteEmailSchema>;

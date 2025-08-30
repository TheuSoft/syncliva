import { z } from "zod";

export const inviteReceptionistSchema = z.object({
  receptionistId: z.string().uuid(),
  email: z.string().email("Email inválido"),
});

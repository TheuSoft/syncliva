import { z } from "zod";

export const resendInviteSchema = z.object({
  doctorId: z.string().uuid(),
  email: z.string().email(),
});

export type ResendInviteSchema = z.infer<typeof resendInviteSchema>;

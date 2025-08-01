import { z } from "zod";

export const inviteDoctorSchema = z.object({
  doctorId: z.string().uuid(),
  email: z.string().email(),
});

export type InviteDoctorSchema = z.infer<typeof inviteDoctorSchema>;

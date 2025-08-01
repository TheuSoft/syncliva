import { z } from "zod";

export const resetDoctorPasswordSchema = z.object({
  doctorId: z.string().uuid({
    message: "ID do médico é obrigatório.",
  }),
});

import { z } from "zod";

export const validateInviteSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

export const registerDoctorSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type ValidateInviteSchema = z.infer<typeof validateInviteSchema>;
export type RegisterDoctorSchema = z.infer<typeof registerDoctorSchema>;

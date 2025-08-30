import { z } from "zod";

export const validateReceptionistInviteSchema = z.object({
  token: z.string(),
});

export const registerReceptionistSchema = z.object({
  token: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

import { z } from "zod";

export const createAdminAccountSchema = z.object({
  // Dados pessoais
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
  
  // Dados da clínica
  clinicName: z.string().trim().min(1, { message: "Nome da clínica é obrigatório" }),
});

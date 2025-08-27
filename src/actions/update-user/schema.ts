import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "receptionist"], {
    required_error: "Role é obrigatório",
    invalid_type_error: "Role deve ser 'admin' ou 'receptionist'",
  }),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

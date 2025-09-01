import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),

  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),

  email: z.string().email({
    message: "Email inválido.",
  }),

  phoneNumber: z.string().trim().min(1, {
    message: "Número de telefone é obrigatório.",
  }),

  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: "CPF inválido. Use o formato 000.000.000-00",
  }),

  sex: z.enum(["male", "female"], {
    required_error: "Sexo é obrigatório.",
  }),

  addressZipCode: z.string().regex(/^\d{5}-\d{3}$/, {
    message: "CEP inválido. Use o formato 00000-000",
  }),

  addressStreet: z.string().trim().min(1, {
    message: "Rua é obrigatória.",
  }),

  addressNumber: z.string().trim().min(1, {
    message: "Número é obrigatório.",
  }),

  addressNeighborhood: z.string().trim().min(1, {
    message: "Bairro é obrigatório.",
  }),

  addressCity: z.string().trim().min(1, {
    message: "Cidade é obrigatória.",
  }),

  addressState: z
    .string()
    .trim()
    .min(2, { message: "UF inválido." })
    .max(2, { message: "UF inválido." }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;

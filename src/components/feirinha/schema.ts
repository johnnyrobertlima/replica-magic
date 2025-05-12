
import * as z from "zod";

export const formSchema = z.object({
  solicitante: z.string().min(1, "O nome do solicitante é obrigatório"),
  nome_lojista: z.string().min(1, "O nome do lojista é obrigatório"),
  telefone_proprietario: z
    .string()
    .min(1, "O telefone do proprietário é obrigatório")
    .refine(
      (value) => {
        // Verifica se há pelo menos 10 números após remover formatação
        const justNumbers = value.replace(/\D/g, '');
        return justNumbers.length >= 10 && justNumbers.length <= 11;
      },
      { message: "Telefone inválido. Deve conter 10 ou 11 dígitos" }
    ),
  corredor: z
    .string()
    .min(1, "O corredor é obrigatório")
    .max(2, "O corredor deve ter no máximo 2 caracteres"),
  numero_banca: z
    .string()
    .min(1, "O número da banca é obrigatório")
    .max(5, "O número da banca deve ter no máximo 5 caracteres"),
  data_inauguracao: z.date({
    required_error: "A data de inauguração é obrigatória",
  }),
  observacao: z.string().optional(),
});

export type NovoClienteFormValues = z.infer<typeof formSchema>;

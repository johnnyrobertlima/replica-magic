
import * as z from "zod";
import { DEPARTMENTS } from "./types";

// Form validation schema
export const requestSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres" }),
  department: z.string().refine(val => DEPARTMENTS.includes(val), {
    message: "Por favor selecione um departamento válido"
  }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  attachment: z.any().optional()
});

export type RequestFormValues = z.infer<typeof requestSchema>;

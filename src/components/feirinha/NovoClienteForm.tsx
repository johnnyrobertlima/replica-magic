
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NovoClienteFeirinha, NovoClienteFeirinhaFormData } from "@/types/feirinha";
import { CalendarIcon } from "lucide-react";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Função para formatar o telefone no padrão XX XXXXX-XXXX
const formatPhoneNumber = (value: string) => {
  // Remove tudo que não for dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a formatação
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

const formSchema = z.object({
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
    .max(2, "O corredor deve ter no máximo 2 dígitos")
    .refine((val) => /^\d{1,2}$/.test(val), { 
      message: "O corredor deve conter apenas números (até 2 dígitos)" 
    }),
  numero_banca: z
    .string()
    .min(1, "O número da banca é obrigatório")
    .max(5, "O número da banca deve ter no máximo 5 dígitos")
    .refine((val) => /^\d{1,5}$/.test(val), { 
      message: "O número da banca deve conter apenas números (até 5 dígitos)" 
    }),
  data_inauguracao: z.date({
    required_error: "A data de inauguração é obrigatória",
  }),
  observacao: z.string().optional(),
});

export type NovoClienteFormValues = z.infer<typeof formSchema>;

export const NovoClienteForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<NovoClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solicitante: "",
      nome_lojista: "",
      telefone_proprietario: "",
      corredor: "",
      numero_banca: "",
      observacao: "",
    },
  });

  const onSubmit = async (values: NovoClienteFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert form values to match the expected NovoClienteFeirinha type
      // ensuring all required fields are present and not optional
      const clienteData: NovoClienteFeirinha = {
        solicitante: values.solicitante,
        nome_lojista: values.nome_lojista,
        telefone_proprietario: values.telefone_proprietario,
        corredor: values.corredor,
        numero_banca: values.numero_banca,
        data_inauguracao: format(values.data_inauguracao, 'yyyy-MM-dd'),
        observacao: values.observacao,
      };

      const { error } = await supabase
        .from("feirinha_novo_cliente")
        .insert(clienteData);

      if (error) {
        console.error("Erro ao inserir dados:", error);
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        });
        return;
      }

      setSubmitted(true);
      form.reset();
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seus dados foram enviados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao processar o formulário:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-3">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold">Cadastro Realizado!</h2>
        <p className="mb-6 text-gray-600">
          Obrigado por cadastrar sua loja. Seus dados foram recebidos com sucesso.
        </p>
        <Button onClick={() => setSubmitted(false)}>Fazer Novo Cadastro</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="solicitante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solicitante</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do solicitante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome_lojista"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Lojista</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do lojista" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone_proprietario"
          render={({ field: { onChange, ...restField } }) => (
            <FormItem>
              <FormLabel>Telefone do Proprietário</FormLabel>
              <FormControl>
                <Input 
                  placeholder="XX XXXXX-XXXX" 
                  {...restField} 
                  onChange={(e) => {
                    const formattedValue = formatPhoneNumber(e.target.value);
                    e.target.value = formattedValue;
                    onChange(e);
                  }}
                  maxLength={14} // Comprimento máximo: XX XXXXX-XXXX
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="corredor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Corredor</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite o corredor (2 dígitos)" 
                  maxLength={2}
                  {...field}
                  onChange={(e) => {
                    // Permite apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero_banca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da Banca</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite o número da banca (até 5 dígitos)" 
                  maxLength={5}
                  {...field}
                  onChange={(e) => {
                    // Permite apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_inauguracao"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Inauguração da Banca</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data de inauguração</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite alguma observação se necessário" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
};

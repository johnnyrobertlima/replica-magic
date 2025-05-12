
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { NovoClienteFeirinhaFormData } from "@/types/feirinha";

const formSchema = z.object({
  solicitante: z.string().min(1, "O nome do solicitante é obrigatório"),
  nome_lojista: z.string().min(1, "O nome do lojista é obrigatório"),
  telefone_proprietario: z.string().min(1, "O telefone do proprietário é obrigatório"),
  corredor: z.string().min(1, "O corredor é obrigatório"),
  numero_banca: z.string().min(1, "O número da banca é obrigatório"),
  data_inauguracao: z.string().min(1, "A data de inauguração é obrigatória"),
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
      data_inauguracao: "",
      observacao: "",
    },
  });

  const onSubmit = async (values: NovoClienteFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("feirinha_novo_cliente")
        .insert(values); // Aqui enviamos values diretamente, não como array

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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone do Proprietário</FormLabel>
              <FormControl>
                <Input placeholder="Digite o telefone" {...field} />
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
                <Input placeholder="Digite o corredor" {...field} />
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
                <Input placeholder="Digite o número da banca" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_inauguracao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Inauguração da Banca</FormLabel>
              <FormControl>
                <Input placeholder="Digite a data de inauguração" {...field} />
              </FormControl>
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  nome_mailing: z.string().min(2, "Nome do mailing deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
});

const MailingRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      nome_mailing: "",
      cidade: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const id = `${values.nome}_${values.telefone}`;
      const { error } = await supabase.from("mailing").insert({
        id,
        nome: values.nome,
        telefone: values.telefone,
        nome_mailing: values.nome_mailing,
        cidade: values.cidade,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            variant: "destructive",
            title: "Erro ao cadastrar",
            description: "Este telefone já está cadastrado para este mailing ou cidade",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao cadastrar",
            description: "Ocorreu um erro ao cadastrar o mailing",
          });
        }
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Mailing cadastrado com sucesso",
      });
      navigate("/client-area");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o mailing",
      });
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cadastro de Mailing</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nome_mailing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Mailing</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button type="submit">Cadastrar</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/client-area")}>
                Voltar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default MailingRegistration;
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

interface MailingFormProps {
  onSuccess: () => void;
  session: any;
}

export const MailingForm = ({ onSuccess, session }: MailingFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Você precisa estar logado para cadastrar um mailing",
      });
      return;
    }

    try {
      const { error } = await supabase.from("mailing").insert({
        id: `${values.nome}_${Date.now()}`,
        nome: values.nome,
        telefone: "",
        nome_mailing: values.nome,
        cidade: "",
      });

      if (error) {
        console.error("Error details:", error);
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: "Ocorreu um erro ao cadastrar o mailing",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Mailing cadastrado com sucesso",
      });
      form.reset();
      onSuccess();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
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
        <Button type="submit">Cadastrar</Button>
      </form>
    </Form>
  );
};
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Insert"];

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  horario_inicial: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Use HH:MM"),
  horario_final: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Use HH:MM"),
  enviar_sabado: z.boolean().default(false),
  enviar_domingo: z.boolean().default(false),
});

export default function WhatsAppClientRegistration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<ClientesWhats>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enviar_sabado: false,
      enviar_domingo: false,
    },
  });

  async function onSubmit(values: ClientesWhats) {
    try {
      const { error } = await supabase
        .from("Clientes_Whats")
        .insert(values);

      if (error) throw error;

      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "O cliente foi adicionado à lista de disparos do WhatsApp.",
      });

      navigate("/client-area");
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro ao tentar cadastrar o cliente. Tente novamente.",
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Cliente para Disparo de WhatsApp</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horario_inicial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário Inicial</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horario_final"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário Final</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enviar_sabado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Pode enviar no Sábado</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enviar_domingo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Pode enviar no Domingo</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit">Cadastrar Cliente</Button>
        </form>
      </Form>
    </div>
  );
}
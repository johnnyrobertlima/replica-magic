import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Database } from "@/integrations/supabase/types";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Insert"];

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  horario_inicial: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Use HH:MM"),
  horario_final: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Use HH:MM"),
  enviar_sabado: z.boolean().default(false),
  enviar_domingo: z.boolean().default(false),
  webhook_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

interface ClientFormProps {
  onSubmit: (values: ClientesWhats) => Promise<void>;
}

export const ClientForm = ({ onSubmit }: ClientFormProps) => {
  const form = useForm<ClientesWhats>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enviar_sabado: false,
      enviar_domingo: false,
      webhook_url: "",
    },
  });

  return (
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
          name="webhook_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Webhook</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://seu-webhook.com/endpoint" 
                  {...field} 
                />
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
  );
};
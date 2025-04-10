
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OniAgenciaService, ServiceFormData } from "@/types/oni-agencia";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  category: z.string().min(1, { message: "Categoria é obrigatória." }),
  color: z.string().min(1, { message: "Cor é obrigatória." }),
  description: z.string().optional(),
});

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => void;
  service?: OniAgenciaService;
  isSubmitting: boolean;
}

const colorOptions = [
  { label: "Roxo", value: "#8B5CF6" },
  { label: "Azul", value: "#3B82F6" },
  { label: "Verde", value: "#10B981" },
  { label: "Amarelo", value: "#F59E0B" },
  { label: "Vermelho", value: "#EF4444" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Esmeralda", value: "#34D399" },
  { label: "Laranja", value: "#F97316" },
  { label: "Ciano", value: "#06B6D4" },
];

const categoryOptions = [
  "Marketing Digital",
  "Design Gráfico",
  "Desenvolvimento Web",
  "Social Media",
  "SEO",
  "Consultoria",
  "Produção de Conteúdo",
  "Fotografia",
  "Vídeo",
  "Outros",
];

export function ServiceForm({ onSubmit, service, isSubmitting }: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: service ? {
      name: service.name,
      category: service.category,
      color: service.color,
      description: service.description || "",
    } : {
      name: "",
      category: "",
      color: "",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-md shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do serviço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição do serviço" 
                    className="min-h-[80px]" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {service ? "Atualizar Serviço" : "Cadastrar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

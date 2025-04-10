
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./ColorPicker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Status } from "./types";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  color: z.string().optional(),
  previous_status_id: z.string().optional().nullable(),
  next_status_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface StatusFormProps {
  entityName: string;
  tableName: string;
  onSuccess: () => void;
  statuses: Status[];
  selectedStatus?: Status | null;
  setSelectedStatus?: (status: Status | null) => void;
}

export function StatusForm({ 
  entityName, 
  tableName, 
  onSuccess, 
  statuses,
  selectedStatus,
  setSelectedStatus
}: StatusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#6E59A5",
      previous_status_id: null,
      next_status_id: null,
    },
  });

  // Atualiza o formulário quando selectedStatus muda
  useEffect(() => {
    if (selectedStatus) {
      form.reset({
        name: selectedStatus.name,
        color: selectedStatus.color || "#6E59A5",
        previous_status_id: selectedStatus.previous_status_id || null,
        next_status_id: selectedStatus.next_status_id || null,
      });
    }
  }, [selectedStatus, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedStatus) {
        // Atualizar status existente
        const { error } = await supabase
          .from(tableName)
          .update({
            name: values.name,
            color: values.color,
            previous_status_id: values.previous_status_id || null,
            next_status_id: values.next_status_id || null,
          })
          .eq("id", selectedStatus.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: `${entityName} atualizado com sucesso!`,
        });
      } else {
        // Criar novo status
        const { error } = await supabase
          .from(tableName)
          .insert({
            name: values.name,
            color: values.color,
            previous_status_id: values.previous_status_id || null,
            next_status_id: values.next_status_id || null,
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: `${entityName} criado com sucesso!`,
        });
      }

      // Limpar formulário
      form.reset({
        name: "",
        color: "#6E59A5",
        previous_status_id: null,
        next_status_id: null,
      });
      
      if (setSelectedStatus) {
        setSelectedStatus(null);
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${selectedStatus ? 'atualizar' : 'criar'} ${entityName.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (setSelectedStatus) {
      setSelectedStatus(null);
    }
    
    form.reset({
      name: "",
      color: "#6E59A5",
      previous_status_id: null,
      next_status_id: null,
    });
  };

  return (
    <div className="bg-background rounded-md border p-6">
      <h3 className="text-lg font-medium mb-4">
        {selectedStatus ? `Editar ${entityName}` : `Novo ${entityName}`}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder={`Nome do ${entityName.toLowerCase()}`} {...field} />
                  </FormControl>
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
                  <FormControl>
                    <ColorPicker value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previous_status_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Anterior</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status anterior (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {statuses
                        .filter(s => 
                          s.id !== selectedStatus?.id && 
                          s.id !== form.getValues("next_status_id")
                        )
                        .map(status => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_status_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próximo Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o próximo status (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {statuses
                        .filter(s => 
                          s.id !== selectedStatus?.id && 
                          s.id !== form.getValues("previous_status_id")
                        )
                        .map(status => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            {selectedStatus && (
              <Button 
                variant="outline" 
                onClick={handleCancel}
                type="button"
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Salvando...' 
                : selectedStatus 
                  ? 'Atualizar' 
                  : 'Salvar'
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

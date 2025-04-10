
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientScopeFormData } from "@/types/oni-agencia";
import { useCreateClientScope, useUpdateClientScope } from "@/hooks/useOniAgenciaClientScopes";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useServices } from "@/hooks/useOniAgenciaServices";
import { X } from "lucide-react";

interface ClientScopeFormProps {
  initialData?: {
    id: string;
    client_id: string;
    service_id: string;
    quantity: number;
  };
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ClientScopeForm({ initialData, onCancel, onSuccess }: ClientScopeFormProps) {
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const createMutation = useCreateClientScope();
  const updateMutation = useUpdateClientScope();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientScopeFormData>({
    defaultValues: {
      client_id: initialData?.client_id || "",
      service_id: initialData?.service_id || "",
      quantity: initialData?.quantity || 1,
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        client_id: initialData.client_id,
        service_id: initialData.service_id,
        quantity: initialData.quantity,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: ClientScopeFormData) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          scope: data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
      onCancel();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {initialData ? "Editar Escopo" : "Novo Escopo"}
          </h3>
          <Button 
            variant="ghost" 
            type="button" 
            size="icon" 
            onClick={onCancel}
          >
            <X size={18} />
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                disabled={isLoadingClients || isSubmitting}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
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
          name="service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select
                disabled={isLoadingServices || isSubmitting}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {initialData ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

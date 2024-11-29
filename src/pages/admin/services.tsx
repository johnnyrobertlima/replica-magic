import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ActionButtons } from "@/components/admin/ActionButtons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceForm } from "@/components/admin/services/ServiceForm";
import { ServiceList } from "@/components/admin/services/ServiceList";
import { handleServiceMutation } from "@/components/admin/services/serviceUtils";
import { Database } from "@/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

export const AdminServices = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createService = useMutation({
    mutationFn: async (formData: FormData) => {
      return handleServiceMutation(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsCreating(false);
      toast({ title: "Serviço criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      return handleServiceMutation(formData, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsCreating(false);
      setEditingService(null);
      toast({ title: "Serviço atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, formData });
    } else {
      await createService.mutateAsync(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {isCreating && (
        <ServiceForm
          onSubmit={handleSubmit}
          editingService={editingService}
          onCancel={() => {
            setIsCreating(false);
            setEditingService(null);
          }}
        />
      )}

      <ServiceList
        services={services}
        onEdit={(service) => {
          setEditingService(service);
          setIsCreating(true);
        }}
      />
    </div>
  );
};
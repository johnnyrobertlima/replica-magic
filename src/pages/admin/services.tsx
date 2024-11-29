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
import { icons } from "@/components/admin/services/icons";

export const AdminServices = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
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
      const serviceData = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        detailed_description: formData.get("detailed_description"),
        icon: String(formData.get("icon")),
        sub_services: JSON.parse(String(formData.get("sub_services") || "[]")),
      };

      const { error } = await supabase.from("services").insert([serviceData]);
      if (error) throw error;
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

  const updateService = async (service: any, formData: FormData) => {
    const updatedData = {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      detailed_description: formData.get("detailed_description"),
      icon: String(formData.get("icon")),
      sub_services: JSON.parse(String(formData.get("sub_services") || "[]")),
    };

    const { error } = await supabase
      .from("services")
      .update(updatedData)
      .eq("id", service.id);

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ["services"] });
    setIsCreating(false);
    setEditingService(null);
    toast({ title: "Serviço atualizado com sucesso!" });
  };

  const toggleService = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Serviço atualizado com sucesso!" });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Serviço excluído com sucesso!" });
    },
  });

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (editingService) {
      await updateService(editingService, formData);
    } else {
      createService.mutate(formData);
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Ícone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services?.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.title}</TableCell>
              <TableCell>{service.description}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {icons.find(i => i.name === service.icon)?.icon}
                  <span>{service.icon}</span>
                </div>
              </TableCell>
              <TableCell>
                {service.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <ActionButtons
                  isActive={service.is_active}
                  onToggle={() => toggleService.mutate({
                    id: service.id,
                    is_active: service.is_active,
                  })}
                  onEdit={() => handleEdit(service)}
                  onDelete={() => deleteService.mutate(service.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
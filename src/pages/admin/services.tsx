import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ActionButtons } from "@/components/admin/ActionButtons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, Power, Server, Settings, Cog, List } from "lucide-react";

const icons = [
  { name: "Monitor", icon: <Monitor className="w-4 h-4" /> },
  { name: "Globe", icon: <Globe className="w-4 h-4" /> },
  { name: "Users", icon: <Users className="w-4 h-4" /> },
  { name: "Video", icon: <Video className="w-4 h-4" /> },
  { name: "Share2", icon: <Share2 className="w-4 h-4" /> },
  { name: "BarChart", icon: <BarChart className="w-4 h-4" /> },
  { name: "Camera", icon: <Camera className="w-4 h-4" /> },
  { name: "Image", icon: <Image className="w-4 h-4" /> },
  { name: "Mic", icon: <Mic className="w-4 h-4" /> },
  { name: "Music", icon: <Music className="w-4 h-4" /> },
  { name: "PaintBrush", icon: <Paintbrush className="w-4 h-4" /> },
  { name: "Settings", icon: <Settings className="w-4 h-4" /> },
  { name: "Tool", icon: <Tool className="w-4 h-4" /> },
  { name: "Wrench", icon: <Wrench className="w-4 h-4" /> },
];

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
}

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
      return data as Service[];
    },
  });

  const createService = useMutation({
    mutationFn: async (formData: FormData) => {
      const serviceData = {
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        icon: String(formData.get("icon")),
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

  const updateService = async (service: Service, formData: FormData) => {
    const updatedData = {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      icon: String(formData.get("icon")),
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

  const handleEdit = (service: Service) => {
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
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input 
                name="title" 
                required 
                defaultValue={editingService?.title}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone</label>
              <Select name="icon" required defaultValue={editingService?.icon}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {icons.map((icon) => (
                    <SelectItem key={icon.name} value={icon.name}>
                      <div className="flex items-center gap-2">
                        {icon.icon}
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea 
              name="description" 
              required 
              defaultValue={editingService?.description}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingService(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingService ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
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

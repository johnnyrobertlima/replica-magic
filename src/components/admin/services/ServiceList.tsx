import { ActionButtons } from "@/components/admin/ActionButtons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { icons } from "./icons";
import { Database } from "@/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

interface ServiceListProps {
  services?: Service[];
  onEdit: (service: Service) => void;
}

export const ServiceList = ({ services, onEdit }: ServiceListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
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
                onEdit={() => onEdit(service)}
                onDelete={() => deleteService.mutate(service.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
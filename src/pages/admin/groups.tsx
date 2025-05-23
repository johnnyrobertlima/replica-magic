
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { GroupForm } from "./groups/GroupForm";
import { GroupsTable } from "./groups/GroupsTable";
import { useGroupMutations } from "./groups/useGroupMutations";
import type { Group, GroupFormData } from "./groups/types";
import { useToast } from "@/hooks/use-toast";

export const AdminGroups = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    homepage: "",
  });
  const { toast } = useToast();
  const { createMutation, updateMutation, deleteMutation } = useGroupMutations();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        const { data, error } = await supabase
          .from("groups")
          .select("*")
          .order("name");
        
        if (error) throw error;
        return data as Group[];
      } catch (error: any) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Erro ao carregar grupos",
          description: error.message || "Ocorreu um erro ao carregar os grupos",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateMutation.mutateAsync(
          { id: editingGroup.id, data: formData },
          {
            onSuccess: () => {
              setIsOpen(false);
              resetForm();
            },
          }
        );
      } else {
        await createMutation.mutateAsync(formData, {
          onSuccess: () => {
            setIsOpen(false);
            resetForm();
          },
        });
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      homepage: group.homepage || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este grupo?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error in handleDelete:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      homepage: "",
    });
    setEditingGroup(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Grupos</h1>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Editar Grupo" : "Criar Novo Grupo"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup 
                  ? "Atualize as informações do grupo selecionado."
                  : "Preencha as informações para criar um novo grupo."}
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              editingGroup={editingGroup}
            />
          </DialogContent>
        </Dialog>
      </div>

      <GroupsTable
        groups={groups || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminGroups;


import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Shield } from "lucide-react";
import { ActionButtons } from "@/components/admin/ActionButtons";

interface Group {
  id: string;
  name: string;
}

interface Permission {
  id: string;
  group_id: string;
  resource_path: string;
  permission_type: 'read' | 'write' | 'admin';
  created_at: string;
  updated_at: string;
}

interface PermissionFormData {
  resource_path: string;
  permission_type: 'read' | 'write' | 'admin';
}

export const AdminPermissions = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [formData, setFormData] = useState<PermissionFormData>({
    resource_path: "",
    permission_type: "read",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data as Group[];
    },
  });

  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions", selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const { data, error } = await supabase
        .from("group_permissions")
        .select("*")
        .eq("group_id", selectedGroupId)
        .order("resource_path");
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!selectedGroupId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      const { error } = await supabase.from("group_permissions").insert([
        {
          group_id: selectedGroupId,
          ...data,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", selectedGroupId] });
      resetForm();
      toast({
        title: "Permissão adicionada",
        description: "A permissão foi adicionada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("group_permissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", selectedGroupId] });
      toast({
        title: "Permissão removida",
        description: "A permissão foi removida com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast({
        title: "Erro",
        description: "Selecione um grupo primeiro",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta permissão?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      resource_path: "",
      permission_type: "read",
    });
  };

  if (isLoadingGroups) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="group">Selecione um grupo</Label>
          <Select
            value={selectedGroupId}
            onValueChange={(value) => setSelectedGroupId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups?.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGroupId && (
          <>
            <form onSubmit={handleSubmit} className="grid gap-4 p-4 border rounded-lg">
              <h2 className="text-lg font-semibold">Adicionar Nova Permissão</h2>
              <div className="grid gap-2">
                <Label htmlFor="resource_path">Caminho do Recurso</Label>
                <Input
                  id="resource_path"
                  placeholder="/admin/users"
                  value={formData.resource_path}
                  onChange={(e) =>
                    setFormData({ ...formData, resource_path: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="permission_type">Tipo de Permissão</Label>
                <Select
                  value={formData.permission_type}
                  onValueChange={(value: 'read' | 'write' | 'admin') =>
                    setFormData({ ...formData, permission_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Leitura</SelectItem>
                    <SelectItem value="write">Escrita</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Permissão
                  </>
                )}
              </Button>
            </form>

            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminho do Recurso</TableHead>
                    <TableHead>Tipo de Permissão</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPermissions ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : permissions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Nenhuma permissão encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    permissions?.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>{permission.resource_path}</TableCell>
                        <TableCell className="capitalize">{permission.permission_type}</TableCell>
                        <TableCell>
                          <ActionButtons
                            onDelete={() => handleDelete(permission.id)}
                            showEdit={false}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPermissions;

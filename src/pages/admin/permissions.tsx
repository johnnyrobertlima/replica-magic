
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { PermissionForm } from "./permissions/PermissionForm";
import { PermissionTable } from "./permissions/PermissionTable";
import { usePermissionMutations } from "./permissions/usePermissionMutations";
import type { Group, Permission } from "./permissions/types";

export const AdminPermissions = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

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

  const { data: existingPaths } = useQuery({
    queryKey: ["existing-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_permissions")
        .select("resource_path")
        .order("resource_path");
      
      if (error) throw error;
      
      const paths = [...new Set(data.map(p => p.resource_path))];
      return paths;
    },
  });

  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions", selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const { data, error } = await supabase
        .from("group_permissions")
        .select(`
          *,
          groups!inner (
            name
          )
        `)
        .eq("group_id", selectedGroupId)
        .order("resource_path");
      
      if (error) throw error;
      
      return data.map(permission => ({
        ...permission,
        group_name: permission.groups.name
      })) as Permission[];
    },
    enabled: !!selectedGroupId,
  });

  const { deleteMutation } = usePermissionMutations(selectedGroupId);

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta permissão?")) {
      deleteMutation.mutate(id);
    }
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
            <PermissionForm
              selectedGroupId={selectedGroupId}
              existingPaths={existingPaths}
              onSuccess={() => {}}
            />
            <PermissionTable
              permissions={permissions}
              isLoading={isLoadingPermissions}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPermissions;

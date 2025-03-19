
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PermissionForm } from "./PermissionForm";
import { PermissionTable } from "./PermissionTable";
import { usePermissionMutations } from "./usePermissionMutations";
import type { Permission } from "./types";

interface PermissionManagerProps {
  selectedGroupId: string;
}

export const PermissionManager = ({ selectedGroupId }: PermissionManagerProps) => {
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

  return (
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
  );
};

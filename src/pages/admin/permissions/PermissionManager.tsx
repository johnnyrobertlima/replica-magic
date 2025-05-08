
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
      console.log("Fetching existing paths");
      const { data, error } = await supabase
        .from("group_permissions")
        .select("resource_path")
        .order("resource_path");
      
      if (error) {
        console.error("Error fetching existing paths:", error);
        throw error;
      }
      
      const paths = [...new Set(data.map(p => p.resource_path))];
      console.log("Fetched paths:", paths);
      return paths;
    },
  });

  const { data: permissions, isLoading: isLoadingPermissions, refetch: refetchPermissions } = useQuery({
    queryKey: ["permissions", selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      
      console.log("Fetching permissions for group:", selectedGroupId);
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
      
      if (error) {
        console.error("Error fetching permissions:", error);
        throw error;
      }
      
      console.log("Fetched permissions:", data);
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
      deleteMutation.mutate(id, {
        onSuccess: () => {
          refetchPermissions();
        }
      });
    }
  };

  return (
    <>
      <PermissionForm
        selectedGroupId={selectedGroupId}
        existingPaths={existingPaths}
        onSuccess={() => refetchPermissions()}
      />
      <PermissionTable
        permissions={permissions}
        isLoading={isLoadingPermissions}
        onDelete={handleDelete}
      />
    </>
  );
};


import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PermissionForm } from "./PermissionForm";
import { PermissionTable } from "./PermissionTable";
import { usePermissionMutations } from "./usePermissionMutations";
import type { Permission } from "./types";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PermissionManagerProps {
  selectedGroupId: string;
}

export const PermissionManager = ({ selectedGroupId }: PermissionManagerProps) => {
  const { toast } = useToast();
  const [existingPaths, setExistingPaths] = useState<string[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing paths manually
  useEffect(() => {
    const fetchPaths = async () => {
      setIsLoadingPaths(true);
      try {
        const { data, error } = await supabase
          .from("group_permissions")
          .select("resource_path")
          .order("resource_path");
        
        if (error) {
          console.error("Error fetching paths:", error);
        } else {
          const paths = [...new Set(data.map(p => p.resource_path))];
          setExistingPaths(paths);
        }
      } catch (err) {
        console.error("Exception fetching paths:", err);
      } finally {
        setIsLoadingPaths(false);
      }
    };

    fetchPaths();
  }, []);

  // Fetch permissions manually
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedGroupId) {
        setPermissions([]);
        setIsLoadingPermissions(false);
        return;
      }

      setIsLoadingPermissions(true);
      setError(null);
      try {
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
          setError("Erro ao buscar permissões");
          toast({
            title: "Erro ao buscar permissões",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setPermissions(data.map(permission => ({
            ...permission,
            group_name: permission.groups.name
          })) as Permission[]);
        }
      } catch (err) {
        console.error("Exception fetching permissions:", err);
        setError("Ocorreu um erro inesperado");
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [selectedGroupId, toast]);

  const { deleteMutation } = usePermissionMutations(selectedGroupId);

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta permissão?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          // Update the local state to remove the deleted permission
          setPermissions(prev => prev.filter(p => p.id !== id));
        }
      });
    }
  };

  const handlePermissionAdded = () => {
    // Refetch permissions
    if (selectedGroupId) {
      const fetchNewPermissions = async () => {
        setIsLoadingPermissions(true);
        try {
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
            console.error("Error refetching permissions:", error);
          } else {
            setPermissions(data.map(permission => ({
              ...permission,
              group_name: permission.groups.name
            })) as Permission[]);
          }
        } catch (err) {
          console.error("Exception refetching permissions:", err);
        } finally {
          setIsLoadingPermissions(false);
        }
      };

      fetchNewPermissions();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-red-200 rounded-md bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-500 mb-2" />
        <p className="text-sm text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <PermissionForm
        selectedGroupId={selectedGroupId}
        existingPaths={existingPaths}
        isLoadingPaths={isLoadingPaths}
        onSuccess={handlePermissionAdded}
      />
      <PermissionTable
        permissions={permissions}
        isLoading={isLoadingPermissions}
        onDelete={handleDelete}
      />
    </>
  );
};

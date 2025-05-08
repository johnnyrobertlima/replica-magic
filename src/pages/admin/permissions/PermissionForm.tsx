
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { PermissionFormData } from "./types";
import { usePermissionMutations } from "./usePermissionMutations";
import { ResourcePathSelector } from "./components/ResourcePathSelector";
import { PermissionTypeSelector } from "./components/PermissionTypeSelector";
import { SubmitButton } from "./components/SubmitButton";
import { RESOURCE_PATHS } from "./constants/routes";
import { Loader2 } from "lucide-react";

interface PermissionFormProps {
  selectedGroupId: string;
  existingPaths?: string[];
  isLoadingPaths?: boolean;
  onSuccess: () => void;
}

export const PermissionForm = ({ 
  selectedGroupId, 
  existingPaths, 
  isLoadingPaths = false,
  onSuccess 
}: PermissionFormProps) => {
  const [formData, setFormData] = useState<PermissionFormData>({
    resource_path: "",
    permission_type: "read",
  });
  const { toast } = useToast();
  const { createMutation } = usePermissionMutations(selectedGroupId);

  // Combinar rotas conhecidas com caminhos existentes e remover duplicatas
  const allPaths = Array.from(new Set([...RESOURCE_PATHS, ...(existingPaths || [])])).sort();

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
    createMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
        onSuccess();
      },
    });
  };

  const resetForm = () => {
    setFormData({
      resource_path: "",
      permission_type: "read",
    });
  };

  const handleResourcePathChange = (value: string) => {
    setFormData(prev => ({ ...prev, resource_path: value }));
  };

  const handlePermissionTypeChange = (value: 'read' | 'write' | 'admin') => {
    setFormData(prev => ({ ...prev, permission_type: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Adicionar Nova Permissão</h2>
      
      {isLoadingPaths ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Carregando caminhos...</span>
        </div>
      ) : (
        <ResourcePathSelector 
          resourcePath={formData.resource_path}
          onResourcePathChange={handleResourcePathChange}
          availablePaths={allPaths}
          selectedGroupId={selectedGroupId}
        />
      )}
      
      <PermissionTypeSelector 
        permissionType={formData.permission_type}
        onPermissionTypeChange={handlePermissionTypeChange}
      />
      
      <SubmitButton isLoading={createMutation.isPending} />
    </form>
  );
};

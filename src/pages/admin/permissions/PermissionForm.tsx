
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import type { PermissionFormData } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { usePermissionMutations } from "./usePermissionMutations";

interface PermissionFormProps {
  selectedGroupId: string;
  existingPaths?: string[];
  onSuccess: () => void;
}

export const PermissionForm = ({ selectedGroupId, existingPaths, onSuccess }: PermissionFormProps) => {
  const [formData, setFormData] = useState<PermissionFormData>({
    resource_path: "",
    permission_type: "read",
  });
  const [customPath, setCustomPath] = useState<boolean>(false);
  const { toast } = useToast();
  const { createMutation } = usePermissionMutations(selectedGroupId);

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
    setCustomPath(false);
  };

  const handleResourcePathChange = (value: string) => {
    if (value === "other") {
      setCustomPath(true);
      setFormData(prev => ({ ...prev, resource_path: "" }));
    } else {
      setCustomPath(false);
      setFormData(prev => ({ ...prev, resource_path: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">Adicionar Nova Permissão</h2>
      <div className="grid gap-2">
        <Label htmlFor="resource_path">Caminho do Recurso</Label>
        {!customPath ? (
          <Select
            value={formData.resource_path}
            onValueChange={handleResourcePathChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um caminho" />
            </SelectTrigger>
            <SelectContent>
              {existingPaths?.map((path) => (
                <SelectItem key={path} value={path}>
                  {path}
                </SelectItem>
              ))}
              <SelectItem value="other">Outro (personalizado)</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            <Input
              id="resource_path"
              placeholder="/admin/users"
              value={formData.resource_path}
              onChange={(e) =>
                setFormData({ ...formData, resource_path: e.target.value })
              }
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCustomPath(false);
                setFormData(prev => ({ ...prev, resource_path: "" }));
              }}
            >
              Voltar para lista
            </Button>
          </div>
        )}
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
  );
};

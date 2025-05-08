
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ResourcePathSelectorProps {
  resourcePath: string;
  onResourcePathChange: (value: string) => void;
  availablePaths: string[];
  selectedGroupId: string;
}

export const ResourcePathSelector = ({
  resourcePath,
  onResourcePathChange,
  availablePaths,
  selectedGroupId
}: ResourcePathSelectorProps) => {
  const [customPath, setCustomPath] = useState<boolean>(false);
  const [existingPermissionPaths, setExistingPermissionPaths] = useState<string[]>([]);

  // Fetch existing permissions for the selected group
  const { data: groupPermissions } = useQuery({
    queryKey: ["group-permissions", selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      
      const { data, error } = await supabase
        .from("group_permissions")
        .select("resource_path, permission_type")
        .eq("group_id", selectedGroupId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGroupId,
  });

  // Update existing permission paths when group permissions change
  useEffect(() => {
    if (groupPermissions) {
      const paths = groupPermissions.map(p => p.resource_path);
      setExistingPermissionPaths(paths);
    }
  }, [groupPermissions]);

  const handleResourcePathChange = (value: string) => {
    if (value === "other") {
      setCustomPath(true);
      onResourcePathChange("");
    } else {
      setCustomPath(false);
      onResourcePathChange(value);
    }
  };

  // Check if a path already has a permission
  const hasPermission = (path: string) => existingPermissionPaths.includes(path);

  return (
    <div className="grid gap-2">
      <Label htmlFor="resource_path">Caminho do Recurso</Label>
      {!customPath ? (
        <Select
          value={resourcePath}
          onValueChange={handleResourcePathChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um caminho" />
          </SelectTrigger>
          <SelectContent>
            {availablePaths.map((path) => (
              <SelectItem 
                key={path} 
                value={path}
                className={cn(
                  hasPermission(path) && "bg-soft-yellow font-medium"
                )}
              >
                {path} {hasPermission(path) && "(já possui permissão)"}
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
            value={resourcePath}
            onChange={(e) => onResourcePathChange(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCustomPath(false);
              onResourcePathChange("");
            }}
          >
            Voltar para lista
          </Button>
        </div>
      )}
    </div>
  );
};

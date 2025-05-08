
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
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);

  // Manually fetch existing permissions for the selected group
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedGroupId) {
        setExistingPermissionPaths([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("group_permissions")
          .select("resource_path, permission_type")
          .eq("group_id", selectedGroupId);
        
        if (error) {
          console.error("Error fetching group permissions:", error);
        } else {
          setExistingPermissionPaths(data.map(p => p.resource_path));
        }
      } catch (err) {
        console.error("Exception fetching group permissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [selectedGroupId]);

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
          <SelectContent className="bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Carregando...</span>
              </div>
            ) : (
              <>
                {availablePaths.map((path) => (
                  <SelectItem 
                    key={path} 
                    value={path}
                    className={cn(
                      hasPermission(path) && "bg-amber-100 font-medium"
                    )}
                  >
                    {path} {hasPermission(path) && "(já possui permissão)"}
                  </SelectItem>
                ))}
                <SelectItem value="other">Outro (personalizado)</SelectItem>
              </>
            )}
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

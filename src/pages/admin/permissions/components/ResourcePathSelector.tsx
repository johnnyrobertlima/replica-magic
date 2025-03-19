
import { useState } from "react";
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

interface ResourcePathSelectorProps {
  resourcePath: string;
  onResourcePathChange: (value: string) => void;
  availablePaths: string[];
}

export const ResourcePathSelector = ({
  resourcePath,
  onResourcePathChange,
  availablePaths
}: ResourcePathSelectorProps) => {
  const [customPath, setCustomPath] = useState<boolean>(false);

  const handleResourcePathChange = (value: string) => {
    if (value === "other") {
      setCustomPath(true);
      onResourcePathChange("");
    } else {
      setCustomPath(false);
      onResourcePathChange(value);
    }
  };

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


import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EditorialLine } from "@/pages/admin/sub-themes/types";
import { Loader2 } from "lucide-react";

interface EditorialLineSelectProps {
  editorialLines: EditorialLine[];
  isLoading: boolean;
  value: string | null;
  onValueChange: (value: string) => void;
}

export function EditorialLineSelect({ 
  editorialLines, 
  isLoading, 
  value, 
  onValueChange 
}: EditorialLineSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="editorial_line_id">Linha Editorial</Label>
      <Select
        value={value || "null"}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="editorial_line_id" className="w-full">
          <SelectValue placeholder="Selecione a linha editorial" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">Nenhuma</SelectItem>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span>Carregando...</span>
            </div>
          ) : (
            editorialLines.map((line) => (
              <SelectItem key={line.id} value={line.id}>
                {line.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

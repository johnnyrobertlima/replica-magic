import { FormField } from "@/components/token/form-fields/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const StatusSelectField: FormField = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="Status">Status</Label>
      <Select
        value={value}
        onValueChange={onChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Ban">Ban</SelectItem>
          <SelectItem value="Ativo">Ativo</SelectItem>
          <SelectItem value="Desativado">Desativado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
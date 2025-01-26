import { FormField } from "@/components/token/form-fields/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ChipNameField: FormField = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="NomedoChip">Nome do Chip</Label>
      <Input
        id="NomedoChip"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
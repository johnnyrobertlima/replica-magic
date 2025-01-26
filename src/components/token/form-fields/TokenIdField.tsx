import { FormField } from "@/components/token/form-fields/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TokenIdField: FormField = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="id">ID do Token</Label>
      <Input
        id="id"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
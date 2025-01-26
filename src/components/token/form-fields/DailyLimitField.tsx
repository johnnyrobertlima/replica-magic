import { FormField } from "@/components/token/form-fields/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DailyLimitField: FormField = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="limitePorDia">Limite por Dia</Label>
      <Input
        id="limitePorDia"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
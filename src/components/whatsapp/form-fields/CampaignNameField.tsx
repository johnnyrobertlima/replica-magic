import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CampaignNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function CampaignNameField({ value, onChange }: CampaignNameFieldProps) {
  return (
    <div>
      <Label htmlFor="name">Nome da Campanha</Label>
      <Input
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o nome da campanha"
      />
    </div>
  );
}
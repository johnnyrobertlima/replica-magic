import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUrlField({ value, onChange }: ImageUrlFieldProps) {
  return (
    <div>
      <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
      <Input
        id="imageUrl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole a URL da imagem"
      />
    </div>
  );
}
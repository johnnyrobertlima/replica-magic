import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MessageFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function MessageField({ value, onChange }: MessageFieldProps) {
  return (
    <div>
      <Label htmlFor="message">Mensagem</Label>
      <Textarea
        id="message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite a mensagem da campanha"
        className="h-32"
      />
    </div>
  );
}
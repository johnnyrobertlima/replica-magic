
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useClientForm } from "@/contexts/bk/ClientFormContext";

export const ContactSection = () => {
  const { formData, onInputChange } = useClientForm();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="TELEFONE">Telefone</Label>
        <Input
          id="TELEFONE"
          name="TELEFONE"
          value={formData.TELEFONE || ""}
          onChange={onInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="EMAIL">Email</Label>
        <Input
          id="EMAIL"
          name="EMAIL"
          type="email"
          value={formData.EMAIL || ""}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TokenFormData } from "@/types/token";

interface TokenFormProps {
  formData: TokenFormData;
  setFormData: (data: TokenFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onCancel: () => void;
}

export const TokenForm = ({
  formData,
  setFormData,
  onSubmit,
  isEditing,
  onCancel,
}: TokenFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">ID do Token</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="NomedoChip">Nome do Chip</Label>
          <Input
            id="NomedoChip"
            value={formData.NomedoChip}
            onChange={(e) => setFormData({ ...formData, NomedoChip: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="limitePorDia">Limite por Dia</Label>
          <Input
            id="limitePorDia"
            type="number"
            value={formData.limitePorDia}
            onChange={(e) => setFormData({ ...formData, limitePorDia: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="Telefone">Telefone</Label>
          <Input
            id="Telefone"
            type="number"
            value={formData.Telefone}
            onChange={(e) => setFormData({ ...formData, Telefone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Input
            id="cliente"
            value={formData.cliente}
            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="Status">Status</Label>
          <Select
            value={formData.Status}
            onValueChange={(value) => setFormData({ ...formData, Status: value })}
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
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {isEditing ? "Atualizar Token" : "Criar Token"}
        </Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
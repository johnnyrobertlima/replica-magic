import { Button } from "@/components/ui/button";
import { TokenFormData } from "@/types/token";
import { TokenIdField } from "./form-fields/TokenIdField";
import { ChipNameField } from "./form-fields/ChipNameField";
import { DailyLimitField } from "./form-fields/DailyLimitField";
import { PhoneField } from "./form-fields/PhoneField";
import { ClientSelectField } from "./form-fields/ClientSelectField";
import { StatusSelectField } from "./form-fields/StatusSelectField";

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
        <TokenIdField
          value={formData.id}
          onChange={(value) => setFormData({ ...formData, id: value })}
        />

        <ChipNameField
          value={formData.NomedoChip}
          onChange={(value) => setFormData({ ...formData, NomedoChip: value })}
        />

        <DailyLimitField
          value={formData.limitePorDia}
          onChange={(value) => setFormData({ ...formData, limitePorDia: value })}
        />

        <PhoneField
          value={formData.Telefone}
          onChange={(value) => setFormData({ ...formData, Telefone: value })}
        />

        <ClientSelectField
          value={formData.cliente}
          onChange={(value) => setFormData({ ...formData, cliente: value })}
        />

        <StatusSelectField
          value={formData.Status}
          onChange={(value) => setFormData({ ...formData, Status: value })}
        />
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
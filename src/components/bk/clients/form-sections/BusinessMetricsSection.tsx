
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useClientForm } from "@/contexts/bk/ClientFormContext";

export const BusinessMetricsSection = () => {
  const { formData, onInputChange, onNumberChange } = useClientForm();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="NOME_CATEGORIA">Nome da Categoria</Label>
        <Input
          id="NOME_CATEGORIA"
          name="NOME_CATEGORIA"
          value={formData.NOME_CATEGORIA || ""}
          onChange={onInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="volume_saudavel_faturamento">Volume Saudável (Faturamento)</Label>
        <Input
          id="volume_saudavel_faturamento"
          name="volume_saudavel_faturamento"
          type="number"
          value={formData.volume_saudavel_faturamento || ""}
          onChange={(e) => onNumberChange(e, 'volume_saudavel_faturamento')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fator_correcao">Fator de Correção</Label>
        <Input
          id="fator_correcao"
          name="fator_correcao"
          type="number"
          step="1"
          min="0"
          value={formData.fator_correcao || ""}
          onChange={(e) => onNumberChange(e, 'fator_correcao')}
        />
      </div>
    </div>
  );
};

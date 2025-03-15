
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Percent } from "lucide-react";
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
        <Label htmlFor="fator_correcao" className="flex items-center">
          <Percent className="mr-1.5 h-4 w-4" />
          Fator de Correção
        </Label>
        <div className="relative">
          <Input
            id="fator_correcao"
            name="fator_correcao"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.fator_correcao || ""}
            onChange={(e) => onNumberChange(e, 'fator_correcao')}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            %
          </span>
        </div>
      </div>
    </div>
  );
};

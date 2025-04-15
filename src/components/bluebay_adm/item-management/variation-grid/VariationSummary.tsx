
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface VariationSummaryProps {
  selectedColorsCount: number;
  selectedSizesCount: number;
  combinationsCount: number;
  existingVariationsCount: number;
  onSave: () => void;
  isLoading: boolean;
  isValid: boolean;
}

export const VariationSummary = ({
  selectedColorsCount,
  selectedSizesCount,
  combinationsCount,
  existingVariationsCount,
  onSave,
  isLoading,
  isValid
}: VariationSummaryProps) => {
  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Combinações a serem geradas: {combinationsCount}</p>
          <p className="text-xs text-muted-foreground">Variações existentes: {existingVariationsCount}</p>
        </div>
        <Button 
          size="sm" 
          onClick={onSave} 
          disabled={isLoading || !isValid}
        >
          <Save className="h-4 w-4 mr-2" />
          Gerar Grade
        </Button>
      </div>
    </div>
  );
};

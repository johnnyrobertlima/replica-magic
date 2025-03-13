
import { Switch } from "@/components/ui/switch";

interface ClientOrderFiltersProps {
  clientName: string;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  onZeroBalanceChange: (checked: boolean) => void;
  onOnlyWithStockChange: (checked: boolean) => void;
}

export const ClientOrderFilters = ({
  clientName,
  showZeroBalance,
  showOnlyWithStock,
  onZeroBalanceChange,
  onOnlyWithStockChange
}: ClientOrderFiltersProps) => {
  console.log(`ClientOrderFilters - clientName: ${clientName}, showZeroBalance: ${showZeroBalance}`);
  
  const handleZeroBalanceChange = (checked: boolean) => {
    console.log(`Switch clicked: showZeroBalance changing to ${checked} for ${clientName}`);
    onZeroBalanceChange(checked);
  };
  
  const handleOnlyWithStockChange = (checked: boolean) => {
    console.log(`Switch clicked: showOnlyWithStock changing to ${checked} for ${clientName}`);
    onOnlyWithStockChange(checked);
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2">
        <Switch
          checked={showZeroBalance}
          onCheckedChange={handleZeroBalanceChange}
          id={`show-zero-balance-${clientName}`}
          className="data-[state=checked]:bg-[#8B5CF6]"
        />
        <label 
          htmlFor={`show-zero-balance-${clientName}`}
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Mostrar itens com saldo zero
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={showOnlyWithStock}
          onCheckedChange={handleOnlyWithStockChange}
          id={`show-only-with-stock-${clientName}`}
          className="data-[state=checked]:bg-[#8B5CF6]"
        />
        <label 
          htmlFor={`show-only-with-stock-${clientName}`}
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Mostrar apenas itens com estoque físico
        </label>
      </div>
    </div>
  );
};

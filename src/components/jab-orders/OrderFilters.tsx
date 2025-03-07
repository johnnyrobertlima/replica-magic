
import { Switch } from "@/components/ui/switch";

interface OrderFiltersProps {
  showZeroBalance: boolean;
  setShowZeroBalance: (show: boolean) => void;
  showOnlyWithStock: boolean;
  setShowOnlyWithStock: (show: boolean) => void;
}

export const OrderFilters = ({
  showZeroBalance,
  setShowZeroBalance,
  showOnlyWithStock,
  setShowOnlyWithStock
}: OrderFiltersProps) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Switch
          checked={showZeroBalance}
          onCheckedChange={setShowZeroBalance}
          id="show-zero-balance"
        />
        <label 
          htmlFor="show-zero-balance"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Mostrar itens com saldo zero
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={showOnlyWithStock}
          onCheckedChange={setShowOnlyWithStock}
          id="show-only-with-stock"
        />
        <label 
          htmlFor="show-only-with-stock"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Mostrar apenas itens com estoque físico
        </label>
      </div>
    </div>
  );
};


import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OrderProgressBars } from "./OrderProgressBars";
import { OrderSummaryGrid } from "./OrderSummaryGrid";
import { ClientOrderFilters } from "./ClientOrderFilters";
import { ClientOrderItemsTable } from "./ClientOrderItemsTable";
import { formatCurrency, formatNumber, getCardBorderClass } from "@/utils/formatters";

interface RepresentanteOrderCardProps {
  representanteName: string;
  data: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const RepresentanteOrderCard = ({
  representanteName,
  data,
  isExpanded,
  onToggleExpand,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: RepresentanteOrderCardProps) => {
  const [localShowZeroBalance, setLocalShowZeroBalance] = useState(showZeroBalance);
  const [localShowOnlyWithStock, setLocalShowOnlyWithStock] = useState(showOnlyWithStock);
  
  const progressFaturamento = data.totalValorPedido > 0 
    ? (data.totalValorFaturado / data.totalValorPedido) * 100 
    : 0;
    
  const progressPotencial = data.totalValorSaldo > 0 
    ? (data.totalValorFaturarComEstoque / data.totalValorSaldo) * 100 
    : 0;
    
  const pedidosCount = new Set(data.allItems.map((item: any) => item.pedido)).size;

  const handleZeroBalanceChange = (checked: boolean) => {
    setLocalShowZeroBalance(checked);
  };

  const handleOnlyWithStockChange = (checked: boolean) => {
    setLocalShowOnlyWithStock(checked);
  };
  
  // Format overdue values
  const valoresVencidos = data.valorVencido || 0;
  
  // Get border color class based on conditions
  const borderColorClass = getCardBorderClass(valoresVencidos, data.totalValorFaturarComEstoque);

  return (
    <Card 
      className={cn(
        "overflow-hidden",
        borderColorClass,
        isExpanded && "col-span-full"
      )}
    >
      <CardContent className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Representante: {representanteName}</h3>
            <p className="text-sm text-muted-foreground">
              Total de Pedidos: {pedidosCount}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-6 w-6 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="mt-4 space-y-4">
          <OrderProgressBars 
            progressFaturamento={progressFaturamento}
            progressPotencial={progressPotencial}
          />

          <OrderSummaryGrid
            totalQuantidadeSaldo={data.totalQuantidadeSaldo}
            totalValorSaldo={data.totalValorSaldo}
            totalValorPedido={data.totalValorPedido}
            totalValorFaturado={data.totalValorFaturado}
            totalValorFaturarComEstoque={data.totalValorFaturarComEstoque}
          />

          {isExpanded && (
            <div className="mt-6">
              <ClientOrderFilters
                clientName={representanteName}
                showZeroBalance={localShowZeroBalance}
                showOnlyWithStock={localShowOnlyWithStock}
                onZeroBalanceChange={handleZeroBalanceChange}
                onOnlyWithStockChange={handleOnlyWithStockChange}
              />

              <ClientOrderItemsTable
                items={data.allItems}
                showZeroBalance={localShowZeroBalance}
                showOnlyWithStock={localShowOnlyWithStock}
                selectedItems={selectedItems}
                onItemSelect={onItemSelect}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

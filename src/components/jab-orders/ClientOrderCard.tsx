
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OrderProgressBars } from "./OrderProgressBars";
import { OrderSummaryGrid } from "./OrderSummaryGrid";
import { ClientOrderFilters } from "./ClientOrderFilters";
import { ClientOrderItemsTable } from "./ClientOrderItemsTable";
import { formatCurrency, formatNumber, getCardBorderClass } from "@/utils/formatters";

interface ClientOrderCardProps {
  clientName: string;
  data: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const ClientOrderCard = ({
  clientName,
  data,
  isExpanded,
  onToggleExpand,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: ClientOrderCardProps) => {
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

  // Display the proper representante name from the data
  const representanteName = data.representanteNome || data.representante || 'Não informado';
  
  // Format volume saudável if available
  const volumeSaudavel = data.volume_saudavel_faturamento !== undefined && data.volume_saudavel_faturamento !== null
    ? formatCurrency(data.volume_saudavel_faturamento)
    : 'Não definido';

  // Format overdue values
  const valoresVencidos = data.valorVencido || 0;
  const titulosVencidos = data.quantidadeTitulosVencidos || 0;
  
  // Determine if values are greater than zero for conditional formatting
  const hasOverdueValues = valoresVencidos > 0;
  const hasOverdueTitles = titulosVencidos > 0;
  
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
            <h3 className="text-lg font-semibold">Cliente: {clientName}</h3>
            <p className="text-sm text-muted-foreground">
              Representante: {representanteName}
            </p>
            <p className="text-sm text-muted-foreground">
              Total de Pedidos: {pedidosCount}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <p className="text-sm text-muted-foreground">
                Volume Saudável: {volumeSaudavel}
              </p>
              <p className="text-sm text-muted-foreground">
                Valores Vencidos: <span className={hasOverdueValues ? "text-red-500 font-medium" : "font-medium"}>{formatCurrency(valoresVencidos)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Títulos Vencidos: <span className={hasOverdueTitles ? "text-red-500 font-medium" : "font-medium"}>{formatNumber(titulosVencidos)}</span>
              </p>
            </div>
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
                clientName={clientName}
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

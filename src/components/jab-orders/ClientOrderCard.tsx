
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OrderProgressBars } from "./OrderProgressBars";
import { OrderSummaryGrid } from "./OrderSummaryGrid";
import { ClientOrderFilters } from "./ClientOrderFilters";
import { ClientOrderItemsTable } from "./ClientOrderItemsTable";

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

  // Format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden",
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
            {data.representanteNome && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Representante:</span> {data.representanteNome}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Total de Pedidos: {pedidosCount}
            </p>
            {data.volumeSaudavel !== undefined && data.volumeSaudavel !== null && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Volume Saudável:</span> {formatCurrency(data.volumeSaudavel)}
              </p>
            )}
            {data.volume_saudavel_faturamento !== undefined && data.volume_saudavel_faturamento !== null && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Volume Saudável:</span> {formatCurrency(data.volume_saudavel_faturamento)}
              </p>
            )}
            {data.valoresVencidos !== undefined && (
              <p className={`text-sm ${data.valoresVencidos > 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                <span className="font-medium">Valores Vencidos:</span> {formatCurrency(data.valoresVencidos)}
              </p>
            )}
            {data.valoresTotais !== undefined && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Valores Totais:</span> {formatCurrency(data.valoresTotais)}
              </p>
            )}
            {data.valoresEmAberto !== undefined && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Valores em Aberto:</span> {formatCurrency(data.valoresEmAberto)}
              </p>
            )}
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
            volumeSaudavel={data.volumeSaudavel || data.volume_saudavel_faturamento}
            valoresTotais={data.valoresTotais}
            valoresEmAberto={data.valoresEmAberto}
            valoresVencidos={data.valoresVencidos}
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

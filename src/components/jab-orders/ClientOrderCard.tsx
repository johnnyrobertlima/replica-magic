
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { OrderProgressBars } from "./OrderProgressBars";
import { OrderSummaryGrid } from "./OrderSummaryGrid";
import { ClientOrderFilters } from "./ClientOrderFilters";
import { ClientOrderItemsTable } from "./ClientOrderItemsTable";
import { ClienteFinanceiroInfo } from "./ClienteFinanceiroInfo";
import { VolumeSaudavelDialog } from "./VolumeSaudavelDialog";
import { updateVolumeSaudavel } from "@/utils/financialUtils";

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

  // Get client financial data if available
  const clienteFinanceiro = data.clienteFinanceiro || {
    valoresTotais: 0,
    valoresEmAberto: 0,
    valoresVencidos: 0,
    volume_saudavel_faturamento: null,
    PES_CODIGO: data.clienteCodigo
  };

  const handleUpdateVolumeSaudavel = async (clienteCodigo: number, valor: number) => {
    return await updateVolumeSaudavel(clienteCodigo, valor);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden",
        isExpanded && "col-span-full"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex-grow cursor-pointer"
            onClick={onToggleExpand}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Cliente: {clientName}</h3>
              {data.representante && (
                <p className="text-sm text-muted-foreground">
                  Representante: {data.representante}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Total de Pedidos: {pedidosCount}
              </p>
            </div>
          </div>
          
          {clienteFinanceiro.PES_CODIGO && (
            <div className="ml-4">
              <VolumeSaudavelDialog
                clienteNome={clientName}
                clienteCodigo={clienteFinanceiro.PES_CODIGO}
                valorAtual={clienteFinanceiro.volume_saudavel_faturamento}
                onUpdate={handleUpdateVolumeSaudavel}
              />
            </div>
          )}
          
          <div className="ml-2 cursor-pointer" onClick={onToggleExpand}>
            {isExpanded ? (
              <ChevronUp className="h-6 w-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {clienteFinanceiro && (
            <ClienteFinanceiroInfo 
              valoresTotais={clienteFinanceiro.valoresTotais || 0}
              valoresEmAberto={clienteFinanceiro.valoresEmAberto || 0}
              valoresVencidos={clienteFinanceiro.valoresVencidos || 0}
              volumeSaudavel={clienteFinanceiro.volume_saudavel_faturamento}
            />
          )}

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

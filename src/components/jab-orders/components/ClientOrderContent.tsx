
import { ClienteFinanceiroInfo } from "../ClienteFinanceiroInfo";
import { OrderProgressBars } from "../OrderProgressBars";
import { OrderSummaryGrid } from "../OrderSummaryGrid";
import { ClientOrderFilters } from "../ClientOrderFilters";
import { ClientOrderItemsTable } from "../ClientOrderItemsTable";

interface ClientOrderContentProps {
  isExpanded: boolean;
  data: any;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  financialData: {
    progressFaturamento: number;
    progressPotencial: number;
  };
  clientName: string;
  localShowZeroBalance: boolean;
  localShowOnlyWithStock: boolean;
  handleZeroBalanceChange: (checked: boolean) => void;
  handleOnlyWithStockChange: (checked: boolean) => void;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const ClientOrderContent = ({
  isExpanded,
  data,
  valoresTotais,
  valoresEmAberto,
  valoresVencidos,
  financialData,
  clientName,
  localShowZeroBalance,
  localShowOnlyWithStock,
  handleZeroBalanceChange,
  handleOnlyWithStockChange,
  selectedItems,
  onItemSelect,
}: ClientOrderContentProps) => {
  console.log('ClientOrderContent - isExpanded:', isExpanded);
  console.log('ClientOrderContent - clientName:', clientName);
  
  if (isExpanded) {
    console.log('ClientOrderContent - expanded data:', data);
    console.log('ClientOrderContent - allItems length:', data?.allItems?.length || 0);
    console.log('ClientOrderContent - first few allItems:', data?.allItems?.slice(0, 3));
    
    // Default localShowZeroBalance should be true for first expansion since we're
    // having problems with items not showing up
    if (!localShowZeroBalance) {
      console.log('Setting showZeroBalance to true to ensure items display');
      setTimeout(() => handleZeroBalanceChange(true), 0);
    }
  }
  
  return (
    <div className="mt-4 space-y-4">
      {isExpanded && (
        <ClienteFinanceiroInfo
          valoresTotais={valoresTotais}
          valoresEmAberto={valoresEmAberto}
          valoresVencidos={valoresVencidos}
          volumeSaudavel={null}
        />
      )}

      <OrderProgressBars 
        progressFaturamento={financialData.progressFaturamento}
        progressPotencial={financialData.progressPotencial}
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
            items={data.allItems || []}
            showZeroBalance={localShowZeroBalance}
            showOnlyWithStock={localShowOnlyWithStock}
            selectedItems={selectedItems}
            onItemSelect={onItemSelect}
          />
        </div>
      )}
    </div>
  );
};

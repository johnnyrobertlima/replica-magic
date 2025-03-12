
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OrderProgressBars } from "./OrderProgressBars";
import { OrderSummaryGrid } from "./OrderSummaryGrid";
import { ClientOrderFilters } from "./ClientOrderFilters";
import { ClientOrderItemsTable } from "./ClientOrderItemsTable";
import { ClienteFinanceiroInfo } from "./ClienteFinanceiroInfo";
import { fetchTitulosVencidos } from "@/utils/financialUtils";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

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
  const [valoresVencidos, setValoresVencidos] = useState(0);
  const [valoresEmAberto, setValoresEmAberto] = useState(0);
  const [valoresTotais, setValoresTotais] = useState(0);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);
  const { toast } = useToast();
  
  const progressFaturamento = data.totalValorPedido > 0 
    ? (data.totalValorFaturado / data.totalValorPedido) * 100 
    : 0;
    
  const progressPotencial = data.totalValorSaldo > 0 
    ? (data.totalValorFaturarComEstoque / data.totalValorSaldo) * 100 
    : 0;
    
  const pedidosCount = new Set(data.allItems.map((item: any) => item.pedido)).size;

  // Fetch financial data for this client - now fetches on component mount, not just when expanded
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!data.PES_CODIGO) return;
      
      setIsLoadingFinancial(true);
      try {
        // Get overdue values using the specified function
        const overdue = await fetchTitulosVencidos(data.PES_CODIGO);
        setValoresVencidos(overdue);
        
        // For now, setting some placeholder values for the other financial fields
        // These would be replaced with actual API calls in a complete implementation
        setValoresTotais(data.totalValorPedido || 0);
        setValoresEmAberto(data.totalValorSaldo || 0);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados financeiros",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFinancial(false);
      }
    };

    // Always fetch financial data, not just when expanded
    fetchFinancialData();
  }, [data.PES_CODIGO, data.totalValorPedido, data.totalValorSaldo, toast]);

  const handleZeroBalanceChange = (checked: boolean) => {
    setLocalShowZeroBalance(checked);
  };

  const handleOnlyWithStockChange = (checked: boolean) => {
    setLocalShowOnlyWithStock(checked);
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
            <p className="text-sm text-muted-foreground">
              Representante: {data.representante || "Não informado"}
            </p>
            <p className="text-sm text-muted-foreground">
              Total de Pedidos: {pedidosCount}
            </p>
            {/* Show overdue value directly in the header */}
            <p className="text-sm font-medium text-red-600">
              {isLoadingFinancial ? (
                "Carregando valor vencido..."
              ) : (
                `Valor Vencido: ${formatCurrency(valoresVencidos)}`
              )}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-6 w-6 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

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

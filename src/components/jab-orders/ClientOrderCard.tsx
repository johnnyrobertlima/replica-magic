
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OrderProgressBars } from "./OrderProgressBars";
import { OrderSummaryGrid } from "./OrderSummaryGrid";
import { ClientOrderFilters } from "./ClientOrderFilters";
import { ClientOrderItemsTable } from "./ClientOrderItemsTable";
import { supabase } from "@/integrations/supabase/client";

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
  const [representanteName, setRepresentanteName] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRepresentanteName = async () => {
      // Only fetch if we have a REPRESENTANTE code
      if (data.REPRESENTANTE) {
        try {
          // Use 'select=*' with content-type application/json to avoid 406 errors
          const { data: repData, error } = await supabase
            .from('vw_representantes')
            .select('*')
            .eq('codigo_representante', data.REPRESENTANTE)
            .maybeSingle();

          if (error) {
            console.error("Error fetching representative:", error);
            return;
          }

          // Check if data was returned and has nome_representante
          if (repData) {
            setRepresentanteName(repData.nome_representante);
          } else {
            // Fallback to using REPRESENTANTE_NOME if available in data
            setRepresentanteName(data.REPRESENTANTE_NOME || "Representante não encontrado");
          }
        } catch (error) {
          console.error("Error in representative fetch:", error);
          // Fallback to REPRESENTANTE_NOME
          setRepresentanteName(data.REPRESENTANTE_NOME || "Erro ao buscar representante");
        }
      } else {
        // If no REPRESENTANTE, use REPRESENTANTE_NOME if available
        setRepresentanteName(data.REPRESENTANTE_NOME || null);
      }
    };
    
    fetchRepresentanteName();
  }, [data.REPRESENTANTE, data.REPRESENTANTE_NOME]);
  
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
            {representanteName && (
              <p className="text-sm text-muted-foreground">
                Representante: {representanteName}
              </p>
            )}
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

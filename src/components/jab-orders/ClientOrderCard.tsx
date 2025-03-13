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
      if (data.REPRESENTANTE) {
        console.log("Representative code:", data.REPRESENTANTE, typeof data.REPRESENTANTE);
        
        try {
          const { data: repData, error } = await supabase
            .from('BLUEBAY_PESSOA')
            .select('APELIDO, RAZAOSOCIAL')
            .eq('PES_CODIGO', data.REPRESENTANTE)
            .limit(1);

          if (error) {
            console.error("Error fetching representative:", error);
            setRepresentanteName(data.REPRESENTANTE_NOME || `Representante ${data.REPRESENTANTE} não encontrado`);
            return;
          }

          console.log("Representative query result:", repData);

          if (repData && repData.length > 0) {
            setRepresentanteName(repData[0].RAZAOSOCIAL || repData[0].APELIDO);
          } else {
            console.log("No representative found for PES_CODIGO:", data.REPRESENTANTE);
            setRepresentanteName(data.REPRESENTANTE_NOME || `Representante ${data.REPRESENTANTE} não encontrado`);
          }
        } catch (error) {
          console.error("Error in representative fetch:", error);
          setRepresentanteName(data.REPRESENTANTE_NOME || "Erro ao buscar representante");
        }
      } else {
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

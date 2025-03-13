
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
        try {
          // Log the representative data we're trying to look up
          console.log("Fetching representative with code:", data.REPRESENTANTE, typeof data.REPRESENTANTE);
          
          // Fetch representative name from vw_representantes view
          const { data: repData, error } = await supabase
            .from('vw_representantes')
            .select('nome_representante, codigo_representante')
            .eq('codigo_representante', data.REPRESENTANTE);

          if (error) {
            console.error("Error fetching representative from view:", error);
            setRepresentanteName(null);
            return;
          }

          console.log("Representative data from view:", repData);

          if (repData && repData.length > 0) {
            setRepresentanteName(repData[0].nome_representante);
            console.log("Representative name set to:", repData[0].nome_representante);
          } else {
            console.log("No representative found in view for code:", data.REPRESENTANTE);
            
            // Try fetching directly from BLUEBAY_PESSOA as fallback
            const { data: pessoaData, error: pessoaError } = await supabase
              .from('BLUEBAY_PESSOA')
              .select('RAZAOSOCIAL, APELIDO')
              .eq('PES_CODIGO', data.REPRESENTANTE)
              .single();
            
            if (pessoaError) {
              console.error("Error fetching from BLUEBAY_PESSOA:", pessoaError);
              // Use fallback text
              const fallbackMsg = `Representante ${data.REPRESENTANTE}`;
              setRepresentanteName(fallbackMsg);
              console.log("Using fallback message after PESSOA error:", fallbackMsg);
            } else if (pessoaData) {
              console.log("Found representative in BLUEBAY_PESSOA:", pessoaData);
              // Prefer RAZAOSOCIAL, fall back to APELIDO
              const name = pessoaData.RAZAOSOCIAL || pessoaData.APELIDO || `Representante ${data.REPRESENTANTE}`;
              setRepresentanteName(name);
              console.log("Using name from BLUEBAY_PESSOA:", name);
            } else {
              // Final fallback
              const fallbackMsg = data.REPRESENTANTE_NOME || `Representante ${data.REPRESENTANTE}`;
              setRepresentanteName(fallbackMsg);
              console.log("Using final fallback:", fallbackMsg);
            }
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
              <p className="text-sm text-muted-foreground font-medium">
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

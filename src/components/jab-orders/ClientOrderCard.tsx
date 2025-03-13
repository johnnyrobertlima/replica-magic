
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useClientOrderCard } from "@/hooks/client-orders/useClientOrderCard";
import { ClientHeader } from "./components/ClientHeader";
import { ClientOrderContent } from "./components/ClientOrderContent";

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
  // Track local filter states
  const [localShowZeroBalance, setLocalShowZeroBalance] = useState(showZeroBalance);
  const [localShowOnlyWithStock, setLocalShowOnlyWithStock] = useState(showOnlyWithStock);
  
  // Update local state when parent props change
  useEffect(() => {
    console.log(`ClientOrderCard useEffect - showZeroBalance changed to ${showZeroBalance} for ${clientName}`);
    setLocalShowZeroBalance(showZeroBalance);
  }, [showZeroBalance, clientName]);
  
  useEffect(() => {
    console.log(`ClientOrderCard useEffect - showOnlyWithStock changed to ${showOnlyWithStock} for ${clientName}`);
    setLocalShowOnlyWithStock(showOnlyWithStock);
  }, [showOnlyWithStock, clientName]);
  
  const {
    valoresVencidos,
    valoresEmAberto,
    valoresTotais,
    isLoadingFinancial,
    pedidosCount,
    financialData
  } = useClientOrderCard(data);

  const handleZeroBalanceChange = (checked: boolean) => {
    console.log(`Setting localShowZeroBalance to ${checked} for ${clientName}`);
    setLocalShowZeroBalance(checked);
  };

  const handleOnlyWithStockChange = (checked: boolean) => {
    console.log(`Setting localShowOnlyWithStock to ${checked} for ${clientName}`);
    setLocalShowOnlyWithStock(checked);
  };

  // Set border color based on financial status
  const getBorderColor = () => {
    if (valoresVencidos > 0) return "border-l-red-500";
    if (data.totalValorFaturarComEstoque > 1500) return "border-l-green-500";
    return "border-l-blue-500";
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden border-l-4",
        getBorderColor(),
        isExpanded && "col-span-full"
      )}
    >
      <CardContent className="p-6">
        <ClientHeader
          clientName={clientName}
          data={data}
          pedidosCount={pedidosCount}
          valoresVencidos={valoresVencidos}
          isLoadingFinancial={isLoadingFinancial}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
        
        <ClientOrderContent
          isExpanded={isExpanded}
          data={data}
          valoresTotais={valoresTotais}
          valoresEmAberto={valoresEmAberto}
          valoresVencidos={valoresVencidos}
          financialData={financialData}
          clientName={clientName}
          localShowZeroBalance={localShowZeroBalance}
          localShowOnlyWithStock={localShowOnlyWithStock}
          handleZeroBalanceChange={handleZeroBalanceChange}
          handleOnlyWithStockChange={handleOnlyWithStockChange}
          selectedItems={selectedItems}
          onItemSelect={onItemSelect}
        />
      </CardContent>
    </Card>
  );
};

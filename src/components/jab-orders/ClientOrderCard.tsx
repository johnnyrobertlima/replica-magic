
import { useState } from "react";
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
  // Start with localShowZeroBalance true to ensure items are displayed initially
  const [localShowZeroBalance, setLocalShowZeroBalance] = useState(true);
  const [localShowOnlyWithStock, setLocalShowOnlyWithStock] = useState(showOnlyWithStock);
  
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

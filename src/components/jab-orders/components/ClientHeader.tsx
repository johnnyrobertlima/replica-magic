
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ClientHeaderProps {
  clientName: string;
  data: {
    representante: string;
    volume_saudavel_faturamento: number;
    uniquePedidosCount?: number; // Add this to support the direct count from DB
  };
  pedidosCount: number;
  valoresVencidos: number;
  isLoadingFinancial: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ClientHeader = ({
  clientName,
  data,
  pedidosCount,
  valoresVencidos,
  isLoadingFinancial,
  isExpanded,
  onToggleExpand,
}: ClientHeaderProps) => {
  // Use uniquePedidosCount if available (from DB), otherwise fallback to calculated pedidosCount
  const displayPedidosCount = data.uniquePedidosCount || pedidosCount;
  
  return (
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
          Total de Pedidos: {displayPedidosCount}
        </p>
        <p className={`text-sm font-medium ${valoresVencidos > 0 ? "text-red-600" : "text-gray-600"}`}>
          {isLoadingFinancial ? (
            "Carregando valor vencido..."
          ) : (
            `Valor Vencido: ${formatCurrency(valoresVencidos)}`
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Volume Saudável: {data.volume_saudavel_faturamento ? formatCurrency(data.volume_saudavel_faturamento) : "Não definido"}
        </p>
      </div>
      {isExpanded ? (
        <ChevronUp className="h-6 w-6 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
};

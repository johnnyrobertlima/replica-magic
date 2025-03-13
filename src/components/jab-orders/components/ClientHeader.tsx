
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ClientHeaderProps {
  clientName: string;
  data: {
    representante: string;
    volume_saudavel_faturamento: number;
    uniquePedidosCount?: number;
    total_pedidos_distintos?: number; // Campo da base de dados
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
  // Usar prioritariamente o valor do banco de dados (total_pedidos_distintos)
  // Se não disponível, usar valores calculados localmente
  const displayPedidosCount = data.total_pedidos_distintos || data.uniquePedidosCount || pedidosCount;
  
  // Logging específico para o ClientHeader
  console.log(`ClientHeader - ${clientName}: total_pedidos_distintos=${data.total_pedidos_distintos}, uniquePedidosCount=${data.uniquePedidosCount}, pedidosCount=${pedidosCount}, display=${displayPedidosCount}`);
  
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

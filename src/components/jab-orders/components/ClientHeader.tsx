
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClientHeaderProps {
  clientName: string;
  data: any;
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
  // For debugging - log all available pedidos count metrics  
  console.log(`ClientHeader - ${clientName}: total_pedidos_distintos=${data.total_pedidos_distintos || 0}, uniquePedidosCount=${data.uniquePedidosCount || 0}, pedidosCount=${pedidosCount}, display=${data.total_pedidos_distintos || pedidosCount || 0}`);

  // Use the total_pedidos_distintos directly from the database when available
  const displayPedidosCount = data.total_pedidos_distintos || pedidosCount || 0;
  
  return (
    <div
      onClick={onToggleExpand}
      className="flex flex-col gap-4 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-lg font-semibold truncate max-w-[260px]">{clientName}</h3>
          {data.representante && (
            <Badge variant="outline" className="text-[10px]">
              {data.representante}
            </Badge>
          )}
          {displayPedidosCount > 1 && (
            <Badge variant="secondary" className="text-[10px]">
              {displayPedidosCount} pedidos
            </Badge>
          )}
        </div>
        <button
          className="p-1 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            window.open(
              `https://app.jubileuartesanais.com.br/pessoa/${data.PES_CODIGO}/financeiro`,
              "_blank"
            );
          }}
          aria-label="Abrir link externo"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {!isLoadingFinancial && (
        <div className="flex flex-wrap gap-2 text-xs">
          <div>
            <span className="font-medium">Valor Faturamento: </span>
            <span
              className={cn({
                "text-green-600":
                  data.totalValorFaturarComEstoque > 1500,
                "text-muted-foreground":
                  data.totalValorFaturarComEstoque <= 1500,
              })}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.totalValorFaturarComEstoque || 0)}
            </span>
          </div>
          <div>
            <span className="font-medium">Valores em aberto: </span>
            <span
              className={cn({
                "text-red-600": valoresVencidos > 0,
                "text-muted-foreground": valoresVencidos === 0,
              })}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(valoresVencidos || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

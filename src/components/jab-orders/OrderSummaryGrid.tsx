
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryGridProps {
  totalQuantidadeSaldo: number;
  totalValorSaldo: number;
  totalValorPedido: number;
  totalValorFaturado: number;
  totalValorFaturarComEstoque: number;
}

export const OrderSummaryGrid = ({
  totalQuantidadeSaldo,
  totalValorSaldo,
  totalValorPedido,
  totalValorFaturado,
  totalValorFaturarComEstoque
}: OrderSummaryGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Quantidade Saldo:</p>
        <p className="font-medium">{totalQuantidadeSaldo}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Valor Total Saldo:</p>
        <p className="font-medium">{formatCurrency(totalValorSaldo)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Valor Total do Pedido:</p>
        <p className="font-medium">{formatCurrency(totalValorPedido)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Valor Faturado:</p>
        <p className="font-medium">{formatCurrency(totalValorFaturado)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Faturar com Estoque:</p>
        <p className="font-medium text-primary">{formatCurrency(totalValorFaturarComEstoque)}</p>
      </div>
    </div>
  );
};

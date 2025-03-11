
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryGridProps {
  totalQuantidadeSaldo: number;
  totalValorSaldo: number;
  totalValorPedido: number;
  totalValorFaturado: number;
  totalValorFaturarComEstoque: number;
  volumeSaudavel?: number | null;
  valoresTotais?: number;
  valoresEmAberto?: number;
  valoresVencidos?: number;
}

export const OrderSummaryGrid = ({
  totalQuantidadeSaldo,
  totalValorSaldo,
  totalValorPedido,
  totalValorFaturado,
  totalValorFaturarComEstoque,
  volumeSaudavel,
  valoresTotais,
  valoresEmAberto,
  valoresVencidos
}: OrderSummaryGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      {volumeSaudavel !== undefined && volumeSaudavel !== null && (
        <div>
          <p className="text-sm text-muted-foreground">Volume Saudável:</p>
          <p className="font-medium text-emerald-600">{formatCurrency(volumeSaudavel)}</p>
        </div>
      )}
      {valoresTotais !== undefined && (
        <div>
          <p className="text-sm text-muted-foreground">Valores Totais:</p>
          <p className="font-medium">{formatCurrency(valoresTotais)}</p>
        </div>
      )}
      {valoresEmAberto !== undefined && (
        <div>
          <p className="text-sm text-muted-foreground">Valores em Aberto:</p>
          <p className="font-medium">{formatCurrency(valoresEmAberto)}</p>
        </div>
      )}
      {valoresVencidos !== undefined && valoresVencidos > 0 && (
        <div>
          <p className="text-sm text-muted-foreground">Valores Vencidos:</p>
          <p className="font-medium text-red-500">{formatCurrency(valoresVencidos)}</p>
        </div>
      )}
    </div>
  );
};

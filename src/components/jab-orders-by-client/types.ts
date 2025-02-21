
import type { JabOrder } from "@/types/jabOrders";

export interface ClientGroup {
  clienteId: number | null;
  clienteNome: string | null;
  pedidos: JabOrder[];
  totalSaldo: number;
  valorTotal: number;
  valorFaturado: number;
  valorFaturarComEstoque: number;
}

export interface OrderProgressProps {
  valorTotalPedido: number;
  valorFaturado: number;
  valorFaturarComEstoque: number;
  valor_total: number;
}

export type { SearchType } from "@/components/jab-orders/SearchFilters";

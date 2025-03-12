
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import type { JabOrder, JabOrderItem } from "@/types/jabOrders";
import type { SearchState } from "@/hooks/client-orders/useClientOrdersSearch";

export interface ClientOrderGroup {
  pedidos: JabOrder[];
  totalQuantidadeSaldo: number;
  totalValorSaldo: number;
  totalValorPedido: number;
  totalValorFaturado: number;
  totalValorFaturarComEstoque: number;
  representante: string | null;
  allItems: (JabOrderItem & {
    pedido: string;
    APELIDO: string | null;
    PES_CODIGO: number;
  })[];
  PES_CODIGO: number;
  valoresVencidos?: number;
  volumeSaudavel?: number | null;
  representanteNome?: string | null;
}

export interface ClientOrdersState extends SearchState {
  expandedClients: Set<string>;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  selectedItemsDetails: Record<string, { qtde: number; valor: number }>;
  isSending: boolean;
}

export interface ClientOrdersTotals {
  totalSelecionado: number;
}

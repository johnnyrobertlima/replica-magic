
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
  representanteNome?: string | null;
  allItems: (JabOrderItem & {
    pedido: string;
    APELIDO: string | null;
    PES_CODIGO: number;
  })[];
  PES_CODIGO: number;
  volume_saudavel_faturamento?: number | null;
  valorVencido?: number | null;
  quantidadeTitulosVencidos?: number | null;
}

export interface ClientOrdersState extends SearchState {
  expandedClients: Set<string>;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  selectedItemsDetails: Record<string, { 
    qtde: number; 
    valor: number; 
    clientName?: string; 
    clientCode?: number;
    pedido?: string;
    DESCRICAO?: string | null;
    PES_CODIGO?: number;
  }>;
  isSending: boolean;
}

export interface ClientOrdersTotals {
  totalSelecionado: number;
}

export { type JabOrder, type JabOrderItem } from "@/types/jabOrders";


import type { JabOrder } from "@/types/jabOrders";

export interface PedidosUnicosResponse {
  data: any[];
  totalCount: number;
}

export interface RelatedDataResponse {
  pessoas: any[];
  itens: any[];
  estoque: any[];
  representantes: any[];
}

export interface PedidosDetalhadosResponse {
  data: any[];
}

export interface OrdersProcessingResult {
  orders: JabOrder[];
  totalCount: number;
  currentPage?: number;
  pageSize?: number;
  itensSeparacao?: Record<string, boolean>;
}

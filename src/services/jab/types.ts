
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

export interface ClientOrdersResult {
  clientGroups: Record<string, any>;
  totalCount: number;
  itensSeparacao?: Record<string, boolean>;
}

export interface PedidosPorClienteResult {
  pes_codigo: number;
  cliente_nome: string;
  representante_codigo: number;
  representante_nome: string;
  total_valor_pedido: number;
  total_valor_faturado: number;
  total_valor_saldo: number;
  total_quantidade_saldo: number;
  volume_saudavel_faturamento: number;
}

export interface ItensPorClienteResult {
  item_codigo: string;
  descricao: string;
  qtde_pedida: number;
  qtde_entregue: number;
  qtde_saldo: number;
  valor_unitario: number;
  pedido: string;
  representante: number;
}

export interface EstoqueItemResult {
  item_codigo: string;
  fisico: number;
}

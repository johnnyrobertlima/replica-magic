
import type { DateRange as DayPickerDateRange } from "react-day-picker";
import type { Database } from "@/integrations/supabase/types";

export type BluebayPedido = Database["public"]["Tables"]["BLUEBAY_PEDIDO"]["Row"];
export type SupabasePedido = Partial<BluebayPedido>;
export type PedidoUnicoResult = Database['public']['Functions']['get_pedidos_unicos']['Returns'][0];

export interface JabOrderItem {
  ITEM_CODIGO: string;
  DESCRICAO: string | null;
  QTDE_SALDO: number;
  QTDE_PEDIDA: number;
  QTDE_ENTREGUE: number;
  VALOR_UNITARIO: number;
  FISICO: number | null;
  valor_total_item?: number;
  valor_faturado_item?: number;
  valor_saldo_item?: number;
  ITEM_SEPARACAO?: number;
  emSeparacao?: boolean;
}

export interface JabOrder {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  total_saldo: number;
  valor_total: number;
  valor_faturado?: number;
  APELIDO: string | null;
  PEDIDO_CLIENTE: string | null;
  STATUS: string;
  REPRESENTANTE_NOME: string | null;
  REPRESENTANTE_CODIGO?: number | null;
  PES_CODIGO: number;
  items: JabOrderItem[];
  valoresVencidos?: number;
}

export interface UseJabOrdersOptions {
  dateRange?: DayPickerDateRange;
  page?: number;
  pageSize?: number;
}

export interface JabOrdersResponse {
  orders: JabOrder[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  itensSeparacao?: Record<string, number>;
  clientesFinanceiros?: any[];
}

export interface JabTotalsResponse {
  valorTotalSaldo: number;
  valorFaturarComEstoque: number;
}


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
  emSeparacao?: boolean;
}

export interface JabOrder {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  total_saldo: number;
  valor_total: number;
  APELIDO: string | null;
  PEDIDO_CLIENTE: string | null;
  STATUS: string;
  REPRESENTANTE_NOME: string | null;
  PES_CODIGO: number;
  REPRESENTANTE: number | null;
  volume_saudavel_faturamento?: number | null;
  VALOR_FATURAR_COM_ESTOQUE?: number; // Added this field
  items: JabOrderItem[];
}

export interface UseJabOrdersOptions {
  dateRange?: DayPickerDateRange;
  page?: number;
  pageSize?: number;
}

export interface JabOrdersResponse {
  orders: JabOrder[];
  totalCount: number;
  itensSeparacao: Record<string, boolean>; // Changed from optional to required
  currentPage?: number;
  pageSize?: number;
}

export interface JabTotalsResponse {
  valorTotalSaldo: number;
  valorFaturarComEstoque: number;
  valorTotalSaldoPeriodo?: number; // Added these fields to match the usage in JabOrders.tsx
  valorFaturarComEstoquePeriodo?: number;
  valoresLiberadosParaFaturamento?: number;
}


import type { Database } from "@/integrations/supabase/types";

export type BluebayPedido = Database["public"]["Tables"]["BLUEBAY_PEDIDO"]["Row"];
export type SupabasePedido = Partial<BluebayPedido>;

export interface JabOrderItem {
  ITEM_CODIGO: string;
  DESCRICAO: string | null;
  QTDE_SALDO: number;
  QTDE_PEDIDA: number;
  QTDE_ENTREGUE: number;
  VALOR_UNITARIO: number;
}

export interface JabOrder {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  QTDE_SALDO: number;
  QTDE_PEDIDA: number;
  QTDE_ENTREGUE: number;
  VALOR_UNITARIO: number;
  total_saldo: number;
  valor_total: number;
  PES_CODIGO: number;
  APELIDO: string | null;
  PEDIDO_CLIENTE: string | null;
  STATUS: string;
  ITEM_CODIGO: string;
  DESCRICAO: string | null;
  items: JabOrderItem[];
}

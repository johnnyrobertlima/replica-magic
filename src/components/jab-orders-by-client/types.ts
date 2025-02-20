
import type { JabOrder } from "@/hooks/useJabOrders";

export interface OrderItem {
  ITEM_CODIGO: string;
  DESCRICAO: string | null;
  QTDE_SALDO: number;
  QTDE_PEDIDA: number;
  QTDE_ENTREGUE: number;
  VALOR_UNITARIO: number;
  PED_NUMPEDIDO: string;
}

export interface ClientOrder {
  APELIDO: string;
  total_saldo: number;
  valor_total: number;
  pedidos: JabOrder[];
  items: OrderItem[];
}

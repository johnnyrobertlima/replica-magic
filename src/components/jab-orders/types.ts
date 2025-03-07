
export interface OrderItem {
  ITEM_CODIGO: string;
  DESCRICAO: string | null;
  QTDE_PEDIDA: number;
  QTDE_ENTREGUE: number;
  QTDE_SALDO: number;
  VALOR_UNITARIO: number;
  FISICO: number | null;
  PED_NUMPEDIDO?: string;
}

export interface Order {
  MATRIZ: number;
  FILIAL: number;
  PED_NUMPEDIDO: string;
  PED_ANOBASE: number;
  STATUS: string;
  APELIDO: string | null;
  PEDIDO_CLIENTE?: string | null;
  total_saldo: number;
  valor_total: number;
  REPRESENTANTE_NOME: string | null;
  items?: OrderItem[];
}

export interface OrderProgressProps {
  valorTotalPedido: number;
  valorFaturado: number;
  valorFaturarComEstoque: number;
  valor_total: number;
}

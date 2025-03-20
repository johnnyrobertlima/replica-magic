
export interface SeparacaoItem {
  created_at: string;
  descricao: string | null;
  id: string;
  item_codigo: string;
  pedido: string;
  quantidade_pedida: number;
  separacao_id: string;
  valor_total: number;
  valor_unitario: number;
}

export interface Separacao {
  id: string;
  cliente_codigo: number;
  cliente_nome: string;
  created_at: string;
  quantidade_itens: number;
  status: string;
  updated_at: string;
  valor_total: number;
  separacao_itens?: SeparacaoItem[];
  representante_nome?: string;
  centrocusto?: 'JAB' | 'BK';
}

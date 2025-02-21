
export interface SeparacaoItem {
  id: string;
  separacao_id: string;
  pedido: string;
  item_codigo: string;
  descricao: string | null;
  quantidade_pedida: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
}

export interface Separacao {
  id: string;
  cliente_nome: string;
  cliente_codigo: number;
  status: 'pendente' | 'aprovado' | 'reprovado';
  valor_total: number;
  quantidade_itens: number;
  created_at: string;
  updated_at: string;
  itens?: SeparacaoItem[];
}

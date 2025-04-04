

// Types related to stock-sales analytics

export interface StockItem {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  GRU_DESCRICAO: string;
  DATACADASTRO: string | null;
  FISICO: number;
  DISPONIVEL: number;
  RESERVADO: number;
  ENTROU: number;
  LIMITE: number;
  QTD_VENDIDA: number;
  VALOR_TOTAL_VENDIDO: number;
  PRECO_MEDIO: number;
  CUSTO_MEDIO: number; // Novo campo para média de custo
  DATA_ULTIMA_VENDA: string | null;
  GIRO_ESTOQUE: number;
  PERCENTUAL_ESTOQUE_VENDIDO: number;
  DIAS_COBERTURA: number;
  PRODUTO_NOVO: boolean;
  RANKING: bigint | number | null; // Updated to accept bigint from PostgreSQL
}


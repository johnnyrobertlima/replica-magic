
export interface EstoqueItem {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  FISICO: number;
  DISPONIVEL: number;
  RESERVADO: number;
  LOCAL: number;
  SUBLOCAL: string;
  GRU_DESCRICAO: string;
}

export interface GroupedEstoque {
  groupName: string;
  items: EstoqueItem[];
  totalItems: number;
  totalFisico: number;
}

import { formatCurrency } from "@/lib/utils";
import type { JabOrder, JabOrderItem } from "@/types/jabOrders";
import { loadClientFinancialData } from "./financialUtils";
import type { SearchType } from "@/types/searchTypes";

// Helper function to get client code from item
export function getClientCodeFromItem(item: JabOrderItem & { PES_CODIGO?: number }): number | null {
  return item.PES_CODIGO || null;
}

// Helper function to calculate total selected items value
export function calculateTotalSelected(selectedItems: string[], groups: Record<string, any>): number {
  let total = 0;
  
  Object.values(groups).forEach((group: any) => {
    group.allItems.forEach((item: any) => {
      if (selectedItems.includes(item.ITEM_CODIGO)) {
        total += (item.VALOR_UNITARIO || 0) * (item.QTDE_SALDO || 0);
      }
    });
  });
  
  return total;
}

// Função para agrupar pedidos por cliente
export function groupOrdersByClient(data: { orders: JabOrder[], totalCount: number, itensSeparacao?: Record<string, boolean> }) {
  const groups: Record<string, any> = {};

  // Processa cada pedido
  for (const order of data.orders) {
    const clientName = order.APELIDO || `Cliente ${order.PES_CODIGO}`;
    const representanteNome = order.REPRESENTANTE_NOME || null;

    // Se o cliente não existir no objeto groups, cria-o
    if (!groups[clientName]) {
      groups[clientName] = {
        clientId: order.PES_CODIGO,
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        allItems: [],
        pedidos: new Set(),
        representanteNome: representanteNome,
        volumeSaudavel: null,
        valoresTotais: undefined,
        valoresEmAberto: undefined,
        valoresVencidos: undefined
      };

      // Carrega dados financeiros do cliente se tiver PES_CODIGO
      if (order.PES_CODIGO) {
        loadClientFinancialData(order.PES_CODIGO)
          .then(financialData => {
            if (groups[clientName]) {
              groups[clientName].valoresTotais = financialData.valoresTotais;
              groups[clientName].valoresEmAberto = financialData.valoresEmAberto;
              groups[clientName].valoresVencidos = financialData.valoresVencidos;
            }
          })
          .catch(err => console.error(`Erro ao carregar dados financeiros para ${clientName}:`, err));

        // Carrega o volume saudável do cliente
        fetch(`/api/volume-saudavel?clienteCodigo=${order.PES_CODIGO}`)
          .then(res => res.json())
          .then(data => {
            if (groups[clientName] && data.volumeSaudavel) {
              groups[clientName].volumeSaudavel = data.volumeSaudavel;
            }
          })
          .catch(() => {
            // Silenciosamente falha se o endpoint não existir
          });
      }
    }

    // Adiciona o pedido ao conjunto de pedidos do cliente
    groups[clientName].pedidos.add(order.PED_NUMPEDIDO);

    // Incrementa os totais para cada cliente
    groups[clientName].totalQuantidadeSaldo += order.total_saldo || 0;
    groups[clientName].totalValorSaldo += order.valor_total || 0;

    // Processa cada item do pedido
    for (const item of order.items || []) {
      // Calcula os valores totais do pedido e faturados
      const valorItem = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
      const valorFaturado = (item.QTDE_ENTREGUE || 0) * (item.VALOR_UNITARIO || 0);
      
      // Incrementa os totais para cada cliente
      groups[clientName].totalValorPedido += valorItem;
      groups[clientName].totalValorFaturado += valorFaturado;

      // Verifica se o item pode ser faturado com estoque
      if (
        (item.FISICO || 0) > 0 &&
        (item.QTDE_SALDO || 0) > 0 &&
        !item.emSeparacao
      ) {
        const valorPossivel = Math.min(item.FISICO || 0, item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0);
        groups[clientName].totalValorFaturarComEstoque += valorPossivel;
      }

      // Adiciona o item à lista de itens do cliente com informações adicionais
      groups[clientName].allItems.push({
        ...item,
        id: `${item.pedido}_${item.ITEM_CODIGO}`,
        valor_total: (item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0),
        qty_com_estoque: Math.min(item.FISICO || 0, item.QTDE_SALDO || 0),
        valor_com_estoque:
          Math.min(item.FISICO || 0, item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0),
      });
    }
  }

  return groups;
}

// Função para filtrar grupos por critérios de busca
export function filterGroupsBySearchCriteria(
  groups: Record<string, any>,
  isSearching: boolean,
  searchQuery: string,
  searchType: 'client' | 'item' | 'pedido'
) {
  // Se não estiver buscando, retorna todos os grupos
  if (!isSearching || !searchQuery) {
    return groups;
  }

  const normalizedQuery = searchQuery.toLowerCase();

  // Filtra por cliente
  if (searchType === 'client') {
    return Object.entries(groups).reduce((filtered, [clientName, data]) => {
      if (clientName.toLowerCase().includes(normalizedQuery)) {
        filtered[clientName] = data;
      }
      return filtered;
    }, {} as Record<string, any>);
  }

  // Filtra por item
  if (searchType === 'item') {
    return Object.entries(groups).reduce((filtered, [clientName, data]) => {
      const hasMatchingItem = data.allItems.some((item: any) =>
        (item.DESCRICAO || '').toLowerCase().includes(normalizedQuery) ||
        (item.ITEM_CODIGO || '').toLowerCase().includes(normalizedQuery)
      );

      if (hasMatchingItem) {
        // Inclui apenas os itens que correspondem à busca
        const filteredItems = data.allItems.filter((item: any) =>
          (item.DESCRICAO || '').toLowerCase().includes(normalizedQuery) ||
          (item.ITEM_CODIGO || '').toLowerCase().includes(normalizedQuery)
        );

        filtered[clientName] = {
          ...data,
          allItems: filteredItems,
        };
      }

      return filtered;
    }, {} as Record<string, any>);
  }

  // Filtra por número de pedido
  if (searchType === 'pedido') {
    return Object.entries(groups).reduce((filtered, [clientName, data]) => {
      const hasMatchingOrder = Array.from(data.pedidos).some((pedido: any) => 
        String(pedido).toLowerCase().includes(normalizedQuery)
      );

      if (hasMatchingOrder) {
        filtered[clientName] = data;
      }

      return filtered;
    }, {} as Record<string, any>);
  }

  return groups;
}

// Helper para formatar valores para exibição
export function formatarValor(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'N/A';
  return formatCurrency(valor);
}

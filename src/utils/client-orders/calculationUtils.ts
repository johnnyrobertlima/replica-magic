
import type { ClientOrderGroup } from "@/types/clientOrders";

// Calculate total value of selected items
export const calculateTotalSelected = (selectedItemsDetails: Record<string, { qtde: number; valor: number }>) => {
  return Object.values(selectedItemsDetails).reduce((total, item) => {
    return total + (item.qtde * item.valor);
  }, 0);
};

// Recalculate totals for a client order group based on its items
export const recalculateGroupTotals = (group: ClientOrderGroup): void => {
  group.totalQuantidadeSaldo = 0;
  group.totalValorSaldo = 0;
  group.totalValorPedido = 0;
  group.totalValorFaturado = 0;
  group.totalValorFaturarComEstoque = 0;
  
  group.allItems.forEach(item => {
    const saldo = item.QTDE_SALDO;
    const valor = item.VALOR_UNITARIO;
    const valorTotal = saldo * valor;
    
    group.totalQuantidadeSaldo += saldo;
    group.totalValorSaldo += valorTotal;
    
    const totalPedido = (item.QTDE_PEDIDA * valor);
    const totalFaturado = (item.QTDE_ENTREGUE * valor);
    
    group.totalValorPedido += totalPedido;
    group.totalValorFaturado += totalFaturado;
    
    if (item.FISICO && item.FISICO > 0) {
      const valorFaturarComEstoque = Math.min(saldo, item.FISICO) * valor;
      group.totalValorFaturarComEstoque += valorFaturarComEstoque;
    }
  });
};

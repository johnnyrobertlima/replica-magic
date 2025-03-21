
import { exportToExcel } from "@/utils/excelUtils";
import { ClientOrderGroup } from "@/types/clientOrders";
import { format } from "date-fns";

export const useExportClientOrders = () => {
  const exportOrdersToExcel = (filteredGroups: Record<string, ClientOrderGroup>) => {
    // Prepare data for export
    const exportData: any[] = [];

    // Iterate through each client group
    Object.entries(filteredGroups).forEach(([clientName, clientGroup]) => {
      // Iterate through each order in the client group
      clientGroup.pedidos.forEach(order => {
        // Calculate the valor faturado correctly using the same logic as displayed in the UI
        const valorFaturado = order.items.reduce((sum, item) => 
          sum + (item.QTDE_ENTREGUE * item.VALOR_UNITARIO), 0);
          
        // Create an entry for each order - using the same values as shown in the UI cards
        exportData.push({
          "PES_CODIGO": clientGroup.PES_CODIGO,
          "Razão Social": clientName,
          "Numero Pedido": order.PED_NUMPEDIDO,
          "Valor do Pedido": order.valor_total,
          "Valor Faturado": valorFaturado,
          "Valor Total Saldo": order.total_saldo * order.items[0]?.VALOR_UNITARIO || 0, // Corrigido para usar o valor monetário, não a quantidade
          "Representante": order.REPRESENTANTE_NOME || "Não informado"
        });
      });
    });

    if (exportData.length === 0) {
      console.warn("Nenhum dado para exportar");
      return 0;
    }

    // Add a summary entry for totals
    const totalValues = {
      "PES_CODIGO": "",
      "Razão Social": "TOTAL",
      "Numero Pedido": "",
      "Valor do Pedido": exportData.reduce((sum, row) => sum + (typeof row["Valor do Pedido"] === 'number' ? row["Valor do Pedido"] : 0), 0),
      "Valor Faturado": exportData.reduce((sum, row) => sum + (typeof row["Valor Faturado"] === 'number' ? row["Valor Faturado"] : 0), 0),
      "Valor Total Saldo": exportData.reduce((sum, row) => sum + (typeof row["Valor Total Saldo"] === 'number' ? row["Valor Total Saldo"] : 0), 0),
      "Representante": ""
    };
    
    exportData.push(totalValues);

    // Generate filename with current date
    const fileName = `pedidos-clientes-${format(new Date(), 'dd-MM-yyyy')}`;
    
    // Use the utility function to export data
    return exportToExcel(exportData, fileName);
  };

  return { exportOrdersToExcel };
};

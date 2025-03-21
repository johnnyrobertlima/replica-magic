
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
        // Create an entry for each order
        exportData.push({
          "PES_CODIGO": clientGroup.PES_CODIGO,
          "Razão Social": clientName,
          "Numero Pedido": order.PED_NUMPEDIDO,
          "Valor do Pedido": order.valor_total,
          "Valor Faturado": order.items.reduce((sum, item) => 
            sum + (item.QTDE_ENTREGUE * item.VALOR_UNITARIO), 0),
          "Valor Total Saldo": order.total_saldo,
          "Representante": order.REPRESENTANTE_NOME || "Não informado"
        });
      });
    });

    if (exportData.length === 0) {
      console.warn("Nenhum dado para exportar");
      return 0;
    }

    // Generate filename with current date
    const fileName = `pedidos-clientes-${format(new Date(), 'dd-MM-yyyy')}`;
    
    // Use the utility function to export data
    return exportToExcel(exportData, fileName);
  };

  return { exportOrdersToExcel };
};


import { useMemo } from "react";
import { calculateTotalSelected } from "@/utils/clientOrdersUtils";
import { useToast } from "@/hooks/use-toast";
import type { ClientOrdersState } from "@/types/clientOrders";

export const useItemSelection = (
  state: ClientOrdersState, 
  setState: React.Dispatch<React.SetStateAction<ClientOrdersState>>, 
  filteredGroups: Record<string, any>
) => {
  const { toast } = useToast();
  const { selectedItems, selectedItemsDetails } = state;
  
  // Calculate the total of selected items
  const totalSelecionado = useMemo(() => 
    calculateTotalSelected(selectedItemsDetails), 
    [selectedItemsDetails]
  );

  const handleItemSelect = (item: any) => {
    const itemCode = item.ITEM_CODIGO;
    
    setState(prev => {
      const isAlreadySelected = prev.selectedItems.includes(itemCode);
      let newSelectedItems = prev.selectedItems;
      let newSelectedItemsDetails = { ...prev.selectedItemsDetails };
      
      if (isAlreadySelected) {
        // Remove item from selection
        newSelectedItems = prev.selectedItems.filter(code => code !== itemCode);
        delete newSelectedItemsDetails[itemCode];
      } else {
        // Add item to selection
        newSelectedItems = [...prev.selectedItems, itemCode];
        newSelectedItemsDetails[itemCode] = {
          qtde: item.QTDE_SALDO,
          valor: item.VALOR_UNITARIO
        };
      }
      
      return { 
        ...prev, 
        selectedItems: newSelectedItems,
        selectedItemsDetails: newSelectedItemsDetails
      };
    });
  };

  const exportSelectedItemsToExcel = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione itens para exportar",
        variant: "destructive"
      });
      return;
    }

    // Get selected items details
    const exportData: any[] = [];
    
    for (const clientName in filteredGroups) {
      const clientGroup = filteredGroups[clientName];
      
      // Find all items in this client that match the selected items
      const selectedClientItems = clientGroup.allItems.filter(
        (item: any) => selectedItems.includes(item.ITEM_CODIGO)
      );
      
      // Add each selected item to the export data
      selectedClientItems.forEach((item: any) => {
        exportData.push({
          Cliente: clientName,
          Representante: clientGroup.representante || "Não informado",
          Pedido: item.pedido,
          'Código do Item': item.ITEM_CODIGO,
          Descrição: item.DESCRICAO || "-",
          'Qtde. Pedida': item.QTDE_PEDIDA,
          'Qtde. Entregue': item.QTDE_ENTREGUE,
          'Qtde. Saldo': item.QTDE_SALDO,
          'Estoque Físico': item.FISICO || 0,
          'Valor Unitário': item.VALOR_UNITARIO,
          'Valor Total': (item.QTDE_SALDO * item.VALOR_UNITARIO)
        });
      });
    }

    if (exportData.length === 0) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível encontrar os detalhes dos itens selecionados",
        variant: "destructive"
      });
      return;
    }

    // Convert data to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Format values properly for CSV, handle commas, quotes, etc.
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          // Format numeric values with proper decimal separator
          if (typeof value === 'number') {
            if (header === 'Valor Unitário' || header === 'Valor Total') {
              return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',');
            }
            return value.toString();
          }
          return value?.toString() || '';
        }).join(',')
      )
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `itens-selecionados-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `${exportData.length} itens exportados com sucesso`,
    });
  };

  return {
    totalSelecionado,
    handleItemSelect,
    exportSelectedItemsToExcel
  };
};

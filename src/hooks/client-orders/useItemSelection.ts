
import { useState, useCallback } from 'react';
import { calculateTotalSelected } from '@/utils/clientOrdersUtils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const useItemSelection = (state: any, setState: any, groups: Record<string, any>) => {
  const [isExporting, setIsExporting] = useState(false);

  // Handle item selection
  const handleItemSelect = useCallback((item: any) => {
    setState(prev => {
      const itemCode = item.ITEM_CODIGO;
      const updatedItems = prev.selectedItems.includes(itemCode)
        ? prev.selectedItems.filter((i: string) => i !== itemCode)
        : [...prev.selectedItems, itemCode];
      
      return {
        ...prev,
        selectedItems: updatedItems
      };
    });
  }, [setState]);

  // Calculate total value of selected items
  const totalSelecionado = calculateTotalSelected(state.selectedItems, groups);

  // Export selected items to Excel
  const exportSelectedItemsToExcel = useCallback(() => {
    if (state.selectedItems.length === 0) {
      toast.error('Nenhum item selecionado para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const selectedItemsData: any[] = [];
      
      // Process each group to find selected items
      Object.entries(groups).forEach(([clientName, data]: [string, any]) => {
        data.allItems.forEach((item: any) => {
          if (state.selectedItems.includes(item.ITEM_CODIGO)) {
            selectedItemsData.push({
              'Cliente': clientName,
              'Código': item.ITEM_CODIGO,
              'Descrição': item.DESCRICAO,
              'Pedido': item.pedido,
              'Qtde Saldo': item.QTDE_SALDO,
              'Qtde Disponível': item.FISICO,
              'Valor Unitário': item.VALOR_UNITARIO,
              'Valor Total': item.valor_total,
            });
          }
        });
      });

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(selectedItemsData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ItensJAB');
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `Itens_Selecionados_JAB_${date}.xlsx`;
      
      // Write to file and download
      XLSX.writeFile(wb, filename);
      
      toast.success('Itens exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar itens:', error);
      toast.error('Erro ao exportar itens');
    } finally {
      setIsExporting(false);
    }
  }, [groups, state.selectedItems]);

  return {
    totalSelecionado,
    isExporting,
    handleItemSelect,
    exportSelectedItemsToExcel
  };
};


import { useState, useMemo, useCallback } from "react";
import { ClientOrdersState } from "@/types/clientOrders";
import { exportToExcel } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

export const useItemSelection = (
  state: ClientOrdersState,
  setState: React.Dispatch<React.SetStateAction<ClientOrdersState>>,
  groupedOrders: Record<string, any>
) => {
  const { toast } = useToast();

  // Calcular o total selecionado com base no estado atual
  const totalSelecionado = useMemo(() => {
    return Object.values(state.selectedItemsDetails).reduce((total, { valor }) => total + valor, 0);
  }, [state.selectedItemsDetails]);

  // Manipulador para seleção/desseleção de itens
  const handleItemSelect = useCallback((item: any) => {
    const itemCode = item.ITEM_CODIGO;
    console.log("Selecting item:", item);
    
    setState(prevState => {
      // Verificar se o item já está selecionado
      const isSelected = prevState.selectedItems.includes(itemCode);
      
      // Atualizar o array selectedItems
      const newSelectedItems = isSelected
        ? prevState.selectedItems.filter(id => id !== itemCode)
        : [...prevState.selectedItems, itemCode];
      
      // Atualizar o objeto selectedItemsDetails
      const newSelectedItemsDetails = { ...prevState.selectedItemsDetails };
      
      if (isSelected) {
        // Remover o item
        delete newSelectedItemsDetails[itemCode];
      } else {
        // Adicionar o item com os detalhes
        // Usar o código do item como chave única para garantir que apenas um item com o mesmo código seja selecionado
        const qtde = item.QTDE_SALDO;
        const valor = qtde * item.VALOR_UNITARIO;
        const clientName = item.APELIDO || '';
        const clientCode = item.PES_CODIGO;
        
        // Importante: capturar e armazenar o número do pedido original exatamente como aparece na tela
        const originalPedido = item.PED_NUMPEDIDO || item.pedido || '';
        
        console.log(`Item ${itemCode} selecionado do pedido original: ${originalPedido}`);
        
        newSelectedItemsDetails[itemCode] = { 
          qtde, 
          valor,
          clientName,
          clientCode,
          pedido: originalPedido, // Armazenar o número do pedido original
          DESCRICAO: item.DESCRICAO,
          PES_CODIGO: item.PES_CODIGO
        };
      }
      
      console.log("Updated selection state:", {
        selectedItems: newSelectedItems, 
        selectedItemsDetails: newSelectedItemsDetails
      });
      
      return {
        ...prevState,
        selectedItems: newSelectedItems,
        selectedItemsDetails: newSelectedItemsDetails
      };
    });
  }, [setState]);

  // Function to export selected items to Excel
  const exportSelectedItemsToExcel = useCallback(() => {
    if (state.selectedItems.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um item para exportar",
      });
      return;
    }

    const selectedItemsData: any[] = [];

    // Collect data for selected items
    Object.entries(groupedOrders).forEach(([clientName, group]) => {
      group.allItems.forEach((item: any) => {
        if (state.selectedItems.includes(item.ITEM_CODIGO)) {
          selectedItemsData.push({
            Cliente: clientName,
            Pedido: item.PED_NUMPEDIDO || item.pedido || '-',
            SKU: item.ITEM_CODIGO,
            Descrição: item.DESCRICAO || '-',
            Solicitado: item.QTDE_PEDIDA,
            Entregue: item.QTDE_ENTREGUE,
            Saldo: item.QTDE_SALDO,
            "Qt. Físico": item.FISICO || '-',
            "Valor Unit.": item.VALOR_UNITARIO,
            "Valor Saldo": item.QTDE_SALDO * item.VALOR_UNITARIO
          });
        }
      });
    });

    // Export to Excel (.xlsx)
    const exportedCount = exportToExcel(selectedItemsData, 'Itens_Selecionados');
    
    if (exportedCount) {
      toast({
        title: "Exportação concluída",
        description: `${exportedCount} itens exportados com sucesso`
      });
    }
  }, [state.selectedItems, groupedOrders, toast]);
  
  // Função para limpar todas as seleções
  const clearSelections = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      selectedItems: [],
      selectedItemsDetails: {}
    }));
    
    toast({
      title: "Limpeza concluída",
      description: "Todas as seleções foram removidas"
    });
  }, [setState, toast]);

  return {
    totalSelecionado,
    handleItemSelect,
    exportSelectedItemsToExcel,
    clearSelections,
  };
};

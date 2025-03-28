
import { useState, useEffect } from "react";
import { EstoqueItem, GroupedEstoque } from "@/types/bk/estoque";

// List of groups to exclude from the results
const EXCLUDED_GROUPS = [
  "MATERIAIS CLIENNTES",
  "MATERIAL P/ USO E CONSUMO",
  "MATERIAL PARA USO/CONSUMO"
];

export const useEstoqueFiltering = (estoqueItems: EstoqueItem[]) => {
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedEstoque[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (estoqueItems.length > 0) {
      filterAndGroupItems(searchTerm);
    }
  }, [searchTerm, estoqueItems]);

  const filterAndGroupItems = (term: string) => {
    // First filter items with stock and exclude unwanted groups
    const itemsWithStock = estoqueItems.filter(
      item => 
        Number(item.FISICO) > 0 && 
        !EXCLUDED_GROUPS.includes(item.GRU_DESCRICAO || '')
    );
    
    console.log(`Total de itens com estoque físico > 0 (excluindo grupos específicos): ${itemsWithStock.length}`);
    
    const filtered = term 
      ? itemsWithStock.filter(
          (item) =>
            item.ITEM_CODIGO.toLowerCase().includes(term.toLowerCase()) ||
            (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term.toLowerCase())) ||
            (item.GRU_DESCRICAO && item.GRU_DESCRICAO.toLowerCase().includes(term.toLowerCase()))
        )
      : itemsWithStock;
    
    console.log(`Total de itens após filtro: ${filtered.length}`);
    setFilteredItems(filtered);
    
    const grouped: Record<string, EstoqueItem[]> = {};
    
    filtered.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    });
    
    const groupedArray: GroupedEstoque[] = Object.entries(grouped).map(([groupName, items]) => ({
      groupName,
      items,
      totalItems: items.length,
      totalFisico: items.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0)
    }));
    
    groupedArray.sort((a, b) => a.groupName.localeCompare(b.groupName));
    
    console.log(`Total de grupos após agrupamento: ${groupedArray.length}`);
    console.log(`Total de itens em todos os grupos: ${groupedArray.reduce((sum, group) => sum + group.totalItems, 0)}`);
    
    setGroupedItems(groupedArray);
  };

  return {
    filteredItems,
    groupedItems,
    searchTerm,
    setSearchTerm,
    filterAndGroupItems
  };
};

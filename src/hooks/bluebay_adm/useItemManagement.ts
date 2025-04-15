
import { useState, useCallback } from "react";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";
import { useItemsData } from "./useItemsData";
import { useItemMutations } from "./useItemMutations";

export const useItemManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use pagination hook com tamanho de página menor para melhor performance
  const pagination = usePagination(50);
  
  // Use item data fetching hook
  const { 
    items, 
    groups, 
    isLoading, 
    totalCount,
    refreshItems
  } = useItemsData(searchTerm, groupFilter, pagination);
  
  // Use item mutations hook
  const { 
    handleSaveItem: saveItemMutation, 
    handleDeleteItem: deleteItemMutation 
  } = useItemMutations(refreshItems);
  
  // Handler para busca com debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  // Handler para mudança de filtro de grupo
  const handleGroupFilterChange = useCallback((value: string) => {
    setGroupFilter(value);
  }, []);
  
  // Handler for saving an item (new or update)
  const handleSaveItem = useCallback(async (itemData: any) => {
    const isUpdate = !!selectedItem;
    await saveItemMutation(itemData, isUpdate);
    setSelectedItem(null);
    setIsDialogOpen(false);
  }, [selectedItem, saveItemMutation]);
  
  // Handler for deleting an item
  const handleDeleteItem = useCallback(async (item: any) => {
    await deleteItemMutation(item);
  }, [deleteItemMutation]);

  return {
    items,
    isLoading,
    searchTerm,
    setSearchTerm: handleSearchChange,
    groupFilter,
    setGroupFilter: handleGroupFilterChange,
    groups,
    selectedItem,
    setSelectedItem,
    isDialogOpen,
    setIsDialogOpen,
    handleSaveItem,
    handleDeleteItem,
    pagination,
    totalCount,
  };
};

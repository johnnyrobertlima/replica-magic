
import { useState } from "react";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";
import { useItemsData } from "./useItemsData";
import { useItemMutations } from "./useItemMutations";

export const useItemManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use pagination hook
  const pagination = usePagination(100);
  
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
  
  // Handler for saving an item (new or update)
  const handleSaveItem = async (itemData: any) => {
    const isUpdate = !!selectedItem;
    await saveItemMutation(itemData, isUpdate);
    setSelectedItem(null);
    setIsDialogOpen(false);
  };
  
  // Handler for deleting an item
  const handleDeleteItem = async (item: any) => {
    await deleteItemMutation(item);
  };

  return {
    items,
    isLoading,
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
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

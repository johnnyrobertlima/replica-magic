
import { useEffect, useCallback } from "react";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";
import { useItemData } from "./item-management/useItemData";
import { useItemGroups } from "./item-management/useItemGroups";
import { useItemOperations } from "./item-management/useItemOperations";
import { useItemFilters } from "./item-management/useItemFilters";
import { useItemDialog } from "./item-management/useItemDialog";

export const useItemManagement = () => {
  // Use pagination hook to manage pagination state
  const pagination = usePagination(100); // 100 items per page

  // Use the refactored hooks
  const { items, isLoading, totalCount, fetchItems } = useItemData(pagination);
  const { groups, fetchGroups } = useItemGroups();
  const { selectedItem, isDialogOpen, openNewItemDialog, openEditItemDialog, closeDialog, setIsDialogOpen } = useItemDialog();

  // Function to refresh items with current filters
  const refreshItemsList = useCallback((search: string, group: string) => {
    pagination.goToPage(1); // Reset to first page on search/filter change
    fetchItems(search, group);
  }, [pagination, fetchItems]);

  // Item operations (save/delete)
  const { handleSaveItem, handleDeleteItem } = useItemOperations(() => {
    refreshItemsList(searchTerm, groupFilter);
  });

  // Search and filter functionality
  const { searchTerm, setSearchTerm, groupFilter, setGroupFilter } = useItemFilters(refreshItemsList);

  // Load groups on initial render
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Initial data load
  useEffect(() => {
    fetchItems(searchTerm, groupFilter);
  }, [fetchItems, searchTerm, groupFilter]);

  // Wrapper for the save operation that handles dialog state
  const handleSaveItemWrapper = async (itemData: any) => {
    const isUpdate = !!selectedItem;
    await handleSaveItem(itemData, isUpdate);
    closeDialog();
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
    isDialogOpen,
    setIsDialogOpen,
    handleSaveItem: handleSaveItemWrapper,
    handleDeleteItem,
    pagination,
    totalCount,
    openNewItemDialog,
    openEditItemDialog,
  };
};

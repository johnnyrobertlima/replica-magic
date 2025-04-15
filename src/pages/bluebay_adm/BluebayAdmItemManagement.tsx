
import { useState, useEffect, useCallback, memo } from "react";
import { Dialog } from "@/components/ui/dialog";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useItemManagement } from "@/hooks/bluebay_adm/useItemManagement";
import { ItemManagementHeader } from "@/components/bluebay_adm/item-management/ItemManagementHeader";
import { ItemFilters } from "@/components/bluebay_adm/item-management/ItemFilters";
import { ItemDialog } from "@/components/bluebay_adm/item-management/ItemDialog";
import { ItemsContent } from "@/components/bluebay_adm/item-management/ItemsContent";

// Componentes memoizados para evitar re-renderizações desnecessárias
const MemoizedItemManagementHeader = memo(ItemManagementHeader);
const MemoizedItemFilters = memo(ItemFilters);
const MemoizedItemsContent = memo(ItemsContent);
const MemoizedItemDialog = memo(ItemDialog);

const BluebayAdmItemManagement = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { 
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
    totalCount
  } = useItemManagement();

  // Only render after component is mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNewItem = useCallback(() => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  }, [setSelectedItem, setIsDialogOpen]);

  const handleEditItem = useCallback((item: any) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }, [setSelectedItem, setIsDialogOpen]);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <MemoizedItemManagementHeader 
          onNewItem={handleNewItem} 
          isDialogOpen={isDialogOpen} 
        />

        <MemoizedItemFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          groupFilter={groupFilter}
          onGroupFilterChange={setGroupFilter}
          groups={groups}
        />

        <MemoizedItemsContent
          items={items}
          isLoading={isLoading}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          pagination={pagination}
          totalCount={totalCount}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <MemoizedItemDialog
            selectedItem={selectedItem}
            onSave={handleSaveItem}
            groups={groups}
          />
        </Dialog>
      </div>
    </main>
  );
};

export default BluebayAdmItemManagement;

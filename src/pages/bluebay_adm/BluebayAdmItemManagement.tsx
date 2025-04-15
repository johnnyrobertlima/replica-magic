
import { useState, useEffect, useCallback, memo } from "react";
import { Dialog } from "@/components/ui/dialog";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useItemManagement } from "@/hooks/bluebay_adm/useItemManagement";
import { ItemManagementHeader } from "@/components/bluebay_adm/item-management/ItemManagementHeader";
import { ItemFilters } from "@/components/bluebay_adm/item-management/ItemFilters";
import { ItemDialog } from "@/components/bluebay_adm/item-management/ItemDialog";
import { ItemsContent } from "@/components/bluebay_adm/item-management/ItemsContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductVariationsManager } from "@/components/bluebay_adm/item-management/ProductVariationsManager";
import { useSearchParams } from "react-router-dom";

// Memoized components to avoid unnecessary re-renders
const MemoizedItemManagementHeader = memo(ItemManagementHeader);
const MemoizedItemFilters = memo(ItemFilters);
const MemoizedItemsContent = memo(ItemsContent);
const MemoizedItemDialog = memo(ItemDialog);
const MemoizedProductVariationsManager = memo(ProductVariationsManager);

const BluebayAdmItemManagement = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "items";
  const productParam = searchParams.get("product");
  
  const [activeTab, setActiveTab] = useState(tabParam);
  
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
    totalCount,
    subcategories,
    brands,
    addSubcategory,
    addBrand,
    isLoadingAll,
    loadAllItems
  } = useItemManagement();

  // Only render after component is mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle URL parameters
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-start">
            <MemoizedItemManagementHeader 
              onNewItem={handleNewItem} 
              isDialogOpen={isDialogOpen} 
            />
            
            <TabsList>
              <TabsTrigger value="items">Produtos</TabsTrigger>
              <TabsTrigger value="variations">Variações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="items" className="space-y-6">
            <MemoizedItemFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              groupFilter={groupFilter}
              onGroupFilterChange={setGroupFilter}
              groups={groups}
              onLoadAllItems={loadAllItems}
              isLoadingAll={isLoadingAll}
            />

            <MemoizedItemsContent
              items={items}
              isLoading={isLoading || isLoadingAll}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              pagination={pagination}
              totalCount={totalCount}
            />
          </TabsContent>
          
          <TabsContent value="variations" className="space-y-6">
            <MemoizedProductVariationsManager initialSelectedProduct={productParam} />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <MemoizedItemDialog
            selectedItem={selectedItem}
            onSave={handleSaveItem}
            groups={groups}
            subcategories={subcategories}
            brands={brands}
            addSubcategory={addSubcategory}
            addBrand={addBrand}
          />
        </Dialog>
      </div>
    </main>
  );
};

export default BluebayAdmItemManagement;

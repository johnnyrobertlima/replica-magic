
import { useState, memo } from "react";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { ItemGroupManagementHeader } from "@/components/bluebay_adm/item-group-management/ItemGroupManagementHeader";
import { ItemGroupTable } from "@/components/bluebay_adm/item-group-management/ItemGroupTable";
import { ItemGroupDialog } from "@/components/bluebay_adm/item-group-management/ItemGroupDialog";
import { useItemGroupManagement } from "@/hooks/bluebay_adm/useItemGroupManagement";
import { Dialog } from "@/components/ui/dialog";

// Memoized components to avoid unnecessary re-renders
const MemoizedItemGroupManagementHeader = memo(ItemGroupManagementHeader);
const MemoizedItemGroupTable = memo(ItemGroupTable);
const MemoizedItemGroupDialog = memo(ItemGroupDialog);

const BluebayAdmItemGrupoManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { groups, isLoading, selectedGroup, setSelectedGroup, handleSaveGroup, empresas } = useItemGroupManagement();

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setIsDialogOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  const onSaveGroup = async (groupData: any) => {
    const success = await handleSaveGroup(groupData);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <MemoizedItemGroupManagementHeader 
            onNewGroup={handleNewGroup}
          />

          <MemoizedItemGroupTable
            groups={groups}
            isLoading={isLoading}
            onEdit={handleEditGroup}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <MemoizedItemGroupDialog
            selectedGroup={selectedGroup}
            onSave={onSaveGroup}
            empresas={empresas}
            isOpen={isDialogOpen}
          />
        </Dialog>
      </div>
    </main>
  );
};

export default BluebayAdmItemGrupoManagement;

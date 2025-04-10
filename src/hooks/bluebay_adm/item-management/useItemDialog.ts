
import { useState } from "react";

export const useItemDialog = () => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openNewItemDialog = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const openEditItemDialog = (item: any) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return {
    selectedItem,
    isDialogOpen,
    openNewItemDialog,
    openEditItemDialog,
    closeDialog,
    setIsDialogOpen,
  };
};

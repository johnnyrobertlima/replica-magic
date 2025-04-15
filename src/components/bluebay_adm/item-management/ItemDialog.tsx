
import { 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ItemForm } from "@/components/bluebay_adm/item-management/ItemForm";

interface ItemDialogProps {
  selectedItem: any | null;
  onSave: (item: any) => Promise<void>;
  groups: any[];
  subcategories: any[];
  brands: any[];
}

export const ItemDialog = ({ 
  selectedItem, 
  onSave, 
  groups,
  subcategories,
  brands 
}: ItemDialogProps) => {
  return (
    <DialogContent className="sm:max-w-[650px]">
      <DialogHeader>
        <DialogTitle>{selectedItem ? "Editar Item" : "Novo Item"}</DialogTitle>
        <DialogDescription>
          {selectedItem 
            ? "Edite as informações do item selecionado" 
            : "Preencha os dados para cadastrar um novo item"}
        </DialogDescription>
      </DialogHeader>
      
      <ItemForm 
        item={selectedItem} 
        onSave={onSave} 
        groups={groups}
        subcategories={subcategories}
        brands={brands}
      />
    </DialogContent>
  );
};

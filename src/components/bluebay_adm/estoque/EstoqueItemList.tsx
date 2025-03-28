
import { Loader2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { GroupedEstoque } from "@/types/bk/estoque";
import { EstoqueGroupItem } from "./EstoqueGroupItem";

interface EstoqueItemListProps {
  isLoading: boolean;
  groupedItems: GroupedEstoque[];
  searchTerm: string;
}

export const EstoqueItemList = ({ isLoading, groupedItems, searchTerm }: EstoqueItemListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-500">
          {searchTerm
            ? "Nenhum item com estoque encontrado para esta busca."
            : "Nenhum item com estoque disponível no momento."}
        </p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {groupedItems.map((group, index) => (
        <EstoqueGroupItem key={index} group={group} index={index} />
      ))}
    </Accordion>
  );
};


import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { GroupHeader } from "./GroupHeader";
import { ItemRow } from "./ItemRow";
import { ItemDetails } from "./ItemDetails";

interface GroupedItemsListProps {
  grupo: string;
  groupItems: any[];
  selectedItemDetails: any;
  isLoadingDetails: boolean;
  onItemClick: (itemCode: string) => void;
}

export const GroupedItemsList: React.FC<GroupedItemsListProps> = ({ 
  grupo, 
  groupItems, 
  selectedItemDetails, 
  isLoadingDetails, 
  onItemClick 
}) => {
  // Calculate group totals
  const groupTotal = groupItems.reduce((sum, item) => sum + item.TOTAL_VALOR, 0);
  const groupQuantity = groupItems.reduce((sum, item) => sum + item.TOTAL_QUANTIDADE, 0);
  
  return (
    <div key={grupo} className="border rounded-md overflow-hidden">
      <GroupHeader 
        grupo={grupo} 
        itemCount={groupItems.length} 
        totalQuantity={groupQuantity} 
        totalValue={groupTotal} 
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-right">Ocorrências</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupItems.map((item) => {
            const isSelected = selectedItemDetails?.itemCode === item.ITEM_CODIGO;
            
            return (
              <React.Fragment key={item.ITEM_CODIGO}>
                <ItemRow 
                  item={item} 
                  isSelected={isSelected} 
                  onItemClick={onItemClick} 
                />
                
                {isSelected && (
                  <ItemDetails 
                    itemCode={item.ITEM_CODIGO}
                    details={selectedItemDetails.details} 
                    isLoading={isLoadingDetails} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

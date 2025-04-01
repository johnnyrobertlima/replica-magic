
import React from "react";
import { LoadingState } from "./table/LoadingState";
import { EmptyState } from "./table/EmptyState";
import { GroupedItemsList } from "./table/GroupedItemsList";

interface ReportsTableProps {
  items: any[];
  isLoading: boolean;
  onItemClick: (itemCode: string) => void;
  selectedItemDetails: any;
  isLoadingDetails: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ 
  items, 
  isLoading, 
  onItemClick,
  selectedItemDetails,
  isLoadingDetails
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!items.length) {
    return <EmptyState />;
  }

  // Group items by grupo
  const groupedItems = items.reduce((acc, item) => {
    const grupo = item.GRU_DESCRICAO || 'Sem Grupo';
    if (!acc[grupo]) {
      acc[grupo] = [];
    }
    acc[grupo].push(item);
    return acc;
  }, {});

  // Sort groups by total value
  const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
    const totalA = groupedItems[a].reduce((sum, item) => sum + item.TOTAL_VALOR, 0);
    const totalB = groupedItems[b].reduce((sum, item) => sum + item.TOTAL_VALOR, 0);
    return totalB - totalA;
  });

  return (
    <div className="space-y-6">
      {sortedGroups.map(grupo => (
        <GroupedItemsList
          key={grupo}
          grupo={grupo}
          groupItems={groupedItems[grupo]}
          selectedItemDetails={selectedItemDetails}
          isLoadingDetails={isLoadingDetails}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

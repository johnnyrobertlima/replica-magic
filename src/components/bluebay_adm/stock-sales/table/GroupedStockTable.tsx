
import React from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableLoadingState } from "./TableLoadingState";
import { TableEmptyState } from "./TableEmptyState";
import { useStockGrouping } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { GroupedTableActions } from "./GroupedTableActions";
import { GroupedTableContent } from "./GroupedTableContent";

interface GroupedStockTableProps {
  items: StockItem[];
  isLoading: boolean;
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

export const GroupedStockTable: React.FC<GroupedStockTableProps> = ({
  items,
  isLoading,
  sortConfig,
  onSort,
}) => {
  const {
    groupedData,
    toggleGroup,
    expandAllGroups,
    collapseAllGroups
  } = useStockGrouping(items);

  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
    <div className="relative">
      <GroupedTableActions 
        groupCount={groupedData.length}
        totalItems={items.length}
        expandAllGroups={expandAllGroups}
        collapseAllGroups={collapseAllGroups}
      />
      
      <GroupedTableContent 
        groupedData={groupedData}
        toggleGroup={toggleGroup}
        sortConfig={sortConfig}
        onSort={onSort}
      />
    </div>
  );
};

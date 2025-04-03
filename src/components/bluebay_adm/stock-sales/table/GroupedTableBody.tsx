
import React from "react";
import { TableBody } from "@/components/ui/table";
import { GroupedStockData } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { StockGroupHeader } from "./StockGroupHeader";
import { StockSalesTableRow } from "./StockSalesTableRow";

interface GroupedTableBodyProps {
  groupedData: GroupedStockData[];
  toggleGroup: (groupName: string) => void;
}

export const GroupedTableBody: React.FC<GroupedTableBodyProps> = ({
  groupedData,
  toggleGroup
}) => {
  return (
    <TableBody>
      {groupedData.map((group) => (
        <React.Fragment key={group.groupName}>
          {/* Group Header Row */}
          <StockGroupHeader 
            group={group}
            onToggle={() => toggleGroup(group.groupName)}
          />
          
          {/* Group Items (when expanded) */}
          {group.isExpanded && group.items.map((item, itemIndex) => (
            <StockSalesTableRow 
              key={`${item.ITEM_CODIGO}-${itemIndex}`} 
              item={item} 
              index={itemIndex}
              isGroupedView
            />
          ))}
        </React.Fragment>
      ))}
    </TableBody>
  );
};

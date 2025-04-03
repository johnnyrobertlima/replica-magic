
import React, { useMemo } from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { GroupedStockData } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { GroupedTableHeader } from "./GroupedTableHeader";
import { GroupedTableBody } from "./GroupedTableBody";

interface GroupedTableContentProps {
  groupedData: GroupedStockData[];
  toggleGroup: (groupName: string) => void;
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

export const GroupedTableContent: React.FC<GroupedTableContentProps> = ({
  groupedData,
  toggleGroup,
  sortConfig,
  onSort
}) => {
  return (
    <div className="relative border rounded-md">
      <div className="overflow-hidden">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="min-w-max">
            <Table className="w-auto min-w-full border-collapse">
              <GroupedTableHeader 
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <GroupedTableBody 
                groupedData={groupedData}
                toggleGroup={toggleGroup}
              />
            </Table>
          </div>
          <ScrollBar orientation="horizontal" className="bg-gray-100" />
        </ScrollArea>
      </div>
    </div>
  );
};

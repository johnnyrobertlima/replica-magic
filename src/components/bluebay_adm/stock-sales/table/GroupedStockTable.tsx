
import React from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableLoadingState } from "./TableLoadingState";
import { TableEmptyState } from "./TableEmptyState";
import { TableSortableHeader } from "./TableSortableHeader";
import { StockSalesTableRow } from "./StockSalesTableRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupedStockData, useStockGrouping } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { StockGroupHeader } from "./StockGroupHeader";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {groupedData.length} grupos, {items.length} itens no total
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={expandAllGroups}
            className="flex items-center gap-1"
          >
            <ChevronDown className="h-4 w-4" />
            Expandir Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={collapseAllGroups}
            className="flex items-center gap-1"
          >
            <ChevronUp className="h-4 w-4" />
            Colapsar Todos
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="overflow-x-auto">
          <Table className="border-collapse min-w-full">
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow className="sticky top-0 z-10 bg-gray-50">
                <TableSortableHeader sortKey="GRU_DESCRICAO" label="Grupo" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="FISICO" label="Estoque Físico" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="DISPONIVEL" label="Disponível" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="RESERVADO" label="Reservado" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="QTD_VENDIDA" label="Qtd. Vendida" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="VALOR_TOTAL_VENDIDO" label="Valor Vendido" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="GIRO_ESTOQUE" label="Giro Estoque" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="PERCENTUAL_ESTOQUE_VENDIDO" label="% Vendido" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="DIAS_COBERTURA" label="Dias Cobertura" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="DATA_ULTIMA_VENDA" label="Última Venda" currentSortConfig={sortConfig} onSort={onSort} />
                <TableSortableHeader sortKey="RANKING" label="Ranking" currentSortConfig={sortConfig} onSort={onSort} />
              </TableRow>
            </TableHeader>
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
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

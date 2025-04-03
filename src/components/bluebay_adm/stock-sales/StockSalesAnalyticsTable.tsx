
import React, { useState } from "react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableLoadingState } from "./table/TableLoadingState";
import { TableEmptyState } from "./table/TableEmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupedStockTable } from "./table/GroupedStockTable";
import { LayersIcon, ListIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSortableHeader } from "./table/TableSortableHeader";
import { StockSalesTableRow } from "./table/StockSalesTableRow";

interface StockSalesAnalyticsTableProps {
  items: StockItem[];
  isLoading: boolean;
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

export const StockSalesAnalyticsTable: React.FC<StockSalesAnalyticsTableProps> = ({
  items,
  isLoading,
  sortConfig,
  onSort,
}) => {
  // Removed displayCount state - always show all items
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped"); // Default to grouped view
  
  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
    <div className="relative">
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grouped")}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            Exibindo total de {items.length} registros.
          </div>
          <TabsList>
            <TabsTrigger value="grouped" className="flex items-center gap-1">
              <LayersIcon className="h-4 w-4" />
              <span>Agrupado</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <ListIcon className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grouped" className="mt-0">
          <GroupedStockTable 
            items={items}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={onSort}
          />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="overflow-x-auto">
              <Table className="border-collapse min-w-full">
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    <TableSortableHeader sortKey="ITEM_CODIGO" label="Código" currentSortConfig={sortConfig} onSort={onSort} />
                    <TableSortableHeader sortKey="DESCRICAO" label="Descrição" currentSortConfig={sortConfig} onSort={onSort} />
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
                  {items.map((item, index) => (
                    <StockSalesTableRow 
                      key={`${item.ITEM_CODIGO}-${index}`} 
                      item={item} 
                      index={index} 
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React, { useState, useMemo } from "react";
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
  // No display count limit - showing all items
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped"); // Default to grouped view
  
  // Use memoization for the full item list to prevent re-rendering on view change
  const memoizedItems = useMemo(() => items, [items]);
  
  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
    <div className="relative">
      <Tabs 
        value={viewMode} 
        onValueChange={(value) => setViewMode(value as "list" | "grouped")}
      >
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
          {viewMode === "grouped" && (
            <GroupedStockTable 
              items={memoizedItems}
              isLoading={isLoading}
              sortConfig={sortConfig}
              onSort={onSort}
            />
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {viewMode === "list" && (
            <div className="border rounded-md overflow-hidden">
              <Table className="border-collapse">
                <TableHeader className="bg-background sticky top-0 z-20">
                  <TableRow>
                    <TableSortableHeader sortKey="ITEM_CODIGO" label="Código" currentSortConfig={sortConfig} onSort={onSort} className="w-[120px]" />
                    <TableSortableHeader sortKey="DESCRICAO" label="Descrição" currentSortConfig={sortConfig} onSort={onSort} className="w-[250px]" />
                    <TableSortableHeader sortKey="GRU_DESCRICAO" label="Grupo" currentSortConfig={sortConfig} onSort={onSort} className="w-[150px]" />
                    <TableSortableHeader sortKey="FISICO" label="Estoque Físico" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[150px]" />
                    <TableSortableHeader sortKey="DISPONIVEL" label="Disponível" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[120px]" />
                    <TableSortableHeader sortKey="RESERVADO" label="Reservado" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[120px]" />
                    <TableSortableHeader sortKey="QTD_VENDIDA" label="Qtd. Vendida" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[130px]" />
                    <TableSortableHeader sortKey="VALOR_TOTAL_VENDIDO" label="Valor Vendido" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[150px]" />
                    <TableSortableHeader sortKey="GIRO_ESTOQUE" label="Giro Estoque" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[120px]" />
                    <TableSortableHeader sortKey="PERCENTUAL_ESTOQUE_VENDIDO" label="% Vendido" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[120px]" />
                    <TableSortableHeader sortKey="DIAS_COBERTURA" label="Dias Cobertura" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[140px]" />
                    <TableSortableHeader sortKey="DATA_ULTIMA_VENDA" label="Última Venda" currentSortConfig={sortConfig} onSort={onSort} className="text-center w-[130px]" />
                    <TableSortableHeader sortKey="RANKING" label="Ranking" currentSortConfig={sortConfig} onSort={onSort} className="text-right w-[100px]" />
                  </TableRow>
                </TableHeader>
              </Table>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <Table className="border-collapse">
                  <TableBody>
                    {memoizedItems.map((item, index) => (
                      <StockSalesTableRow 
                        key={`${item.ITEM_CODIGO}-${index}`} 
                        item={item} 
                        index={index} 
                      />
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

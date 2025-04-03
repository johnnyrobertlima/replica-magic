
import React, { useState, useEffect } from "react";
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
  const [visibleItems, setVisibleItems] = useState<StockItem[]>([]);
  const [displayCount, setDisplayCount] = useState(500); // Increased initial load count
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped"); // Default to grouped view
  
  // Load a limited number of items initially for better performance
  useEffect(() => {
    if (items.length > 0) {
      setVisibleItems(items.slice(0, displayCount));
      console.log(`Carregando ${displayCount} itens de ${items.length} disponíveis`);
    } else {
      setVisibleItems([]);
    }
  }, [items, displayCount]);

  // Load more items when scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 300 &&
      displayCount < items.length
    ) {
      const newDisplayCount = Math.min(displayCount + 500, items.length); // Load 500 more items at a time
      console.log(`Carregando mais itens: ${displayCount} -> ${newDisplayCount}`);
      setDisplayCount(newDisplayCount);
    }
  };

  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  // Create a Set to track item codes and prevent duplicates
  const processedCodes = new Set<string>();
  
  // Filter out duplicate items based on ITEM_CODIGO
  const uniqueItems = visibleItems.filter(item => {
    if (processedCodes.has(item.ITEM_CODIGO)) {
      return false;
    }
    processedCodes.add(item.ITEM_CODIGO);
    return true;
  });

  return (
    <div className="relative">
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grouped")}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            Exibindo {uniqueItems.length} de {items.length} registros. 
            {displayCount < items.length && " Role para baixo para carregar mais."}
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
            items={uniqueItems}
            isLoading={isLoading}
            sortConfig={sortConfig}
            onSort={onSort}
          />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <ScrollArea className="h-[calc(100vh-250px)]" onScrollCapture={handleScroll}>
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
                  {uniqueItems.map((item, index) => (
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
          
          {displayCount < items.length && (
            <div className="mt-4 text-center">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => setDisplayCount(prev => Math.min(prev + 1000, items.length))}
              >
                Carregar mais ({items.length - displayCount} restantes)
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockItem } from "@/services/bluebay/stockSalesAnalyticsService";
import { TableLoadingState } from "./table/TableLoadingState";
import { TableEmptyState } from "./table/TableEmptyState";
import { TableSortableHeader } from "./table/TableSortableHeader";
import { StockSalesTableRow } from "./table/StockSalesTableRow";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [displayCount, setDisplayCount] = useState(100);
  
  // Inicialmente carregar um número limitado de itens para renderização rápida
  useEffect(() => {
    if (items.length > 0) {
      setVisibleItems(items.slice(0, displayCount));
    } else {
      setVisibleItems([]);
    }
  }, [items, displayCount]);

  // Função para carregar mais itens quando o usuário rolar para baixo
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Se o usuário rolou para perto do fim e não estamos mostrando todos os itens
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 200 &&
      displayCount < items.length
    ) {
      // Aumentar o número de itens exibidos
      setDisplayCount(prev => Math.min(prev + 100, items.length));
    }
  };

  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
    <div className="relative">
      {items.length > displayCount && (
        <div className="text-sm text-gray-500 mb-2">
          Exibindo {visibleItems.length} de {items.length} registros. 
          {displayCount < items.length && " Role para baixo para carregar mais."}
        </div>
      )}
      
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
              {visibleItems.map((item) => (
                <StockSalesTableRow key={item.ITEM_CODIGO} item={item} />
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      
      {displayCount < items.length && (
        <div className="mt-4 text-center">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => setDisplayCount(prev => Math.min(prev + 500, items.length))}
          >
            Carregar mais ({items.length - displayCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
};


import React from "react";
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
  if (isLoading) {
    return <TableLoadingState />;
  }

  if (items.length === 0) {
    return <TableEmptyState />;
  }

  return (
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
          {items.map((item) => (
            <StockSalesTableRow key={item.ITEM_CODIGO} item={item} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

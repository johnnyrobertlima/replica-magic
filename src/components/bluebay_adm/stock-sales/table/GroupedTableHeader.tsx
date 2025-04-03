
import React from "react";
import { TableHeader, TableRow } from "@/components/ui/table";
import { TableSortableHeader } from "./TableSortableHeader";
import { StockItem } from "@/services/bluebay/stockSales/types";

interface GroupedTableHeaderProps {
  sortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

export const GroupedTableHeader: React.FC<GroupedTableHeaderProps> = ({
  sortConfig,
  onSort
}) => {
  return (
    <TableHeader className="sticky top-0 z-20">
      <TableRow>
        <TableSortableHeader 
          sortKey="GRU_DESCRICAO" 
          label="Grupo" 
          currentSortConfig={sortConfig} 
          onSort={onSort}
          width="250px" 
        />
        <TableSortableHeader 
          sortKey="FISICO" 
          label="Estoque Físico" 
          currentSortConfig={sortConfig} 
          onSort={onSort}
          width="120px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="DISPONIVEL" 
          label="Disponível" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="120px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="RESERVADO" 
          label="Reservado" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="120px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="QTD_VENDIDA" 
          label="Qtd. Vendida" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="120px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="VALOR_TOTAL_VENDIDO" 
          label="Valor Vendido" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="150px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="GIRO_ESTOQUE" 
          label="Giro Estoque" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="120px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="PERCENTUAL_ESTOQUE_VENDIDO" 
          label="% Vendido" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="100px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="DIAS_COBERTURA" 
          label="Dias Cobertura" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="120px"
          align="right"
        />
        <TableSortableHeader 
          sortKey="DATA_ULTIMA_VENDA" 
          label="Última Venda" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="120px"
          align="center"
        />
        <TableSortableHeader 
          sortKey="RANKING" 
          label="Ranking" 
          currentSortConfig={sortConfig} 
          onSort={onSort} 
          width="100px"
          align="right"
        />
      </TableRow>
    </TableHeader>
  );
};

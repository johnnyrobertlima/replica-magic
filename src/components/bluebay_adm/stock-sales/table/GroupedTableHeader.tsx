
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
  visibleColumns: Record<string, boolean>;
}

export const GroupedTableHeader: React.FC<GroupedTableHeaderProps> = ({
  sortConfig,
  onSort,
  visibleColumns
}) => {
  return (
    <TableHeader className="sticky top-0 z-40 bg-gray-50 shadow-sm">
      <TableRow>
        <TableSortableHeader 
          sortKey="GRU_DESCRICAO" 
          label="Grupo" 
          currentSortConfig={sortConfig} 
          onSort={onSort}
          width="250px"
          isSticky={true}
          left={0}
        />
        
        {visibleColumns.FISICO && (
          <TableSortableHeader 
            sortKey="FISICO" 
            label="Estoque Físico" 
            currentSortConfig={sortConfig} 
            onSort={onSort}
            width="120px"
            align="right"
          />
        )}
        
        {visibleColumns.DISPONIVEL && (
          <TableSortableHeader 
            sortKey="DISPONIVEL" 
            label="Disponível" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="right"
          />
        )}
        
        {visibleColumns.RESERVADO && (
          <TableSortableHeader 
            sortKey="RESERVADO" 
            label="Reservado" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="right"
          />
        )}

        {visibleColumns.ENTROU && (
          <TableSortableHeader 
            sortKey="ENTROU" 
            label="Entrou" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="right"
          />
        )}
        
        {visibleColumns.QTD_VENDIDA && (
          <TableSortableHeader 
            sortKey="QTD_VENDIDA" 
            label="Qtd. Vendida" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="right"
          />
        )}
        
        {visibleColumns.VALOR_TOTAL_VENDIDO && (
          <TableSortableHeader 
            sortKey="VALOR_TOTAL_VENDIDO" 
            label="Valor Vendido" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="150px"
            align="right"
          />
        )}
        
        {visibleColumns.GIRO_ESTOQUE && (
          <TableSortableHeader 
            sortKey="GIRO_ESTOQUE" 
            label="Giro Estoque" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="right"
          />
        )}
        
        {visibleColumns.PERCENTUAL_ESTOQUE_VENDIDO && (
          <TableSortableHeader 
            sortKey="PERCENTUAL_ESTOQUE_VENDIDO" 
            label="% Vendido" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="100px"
            align="right"
          />
        )}
        
        {visibleColumns.DIAS_COBERTURA && (
          <TableSortableHeader 
            sortKey="DIAS_COBERTURA" 
            label="Dias Cobertura" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="right"
          />
        )}
        
        {visibleColumns.DATA_ULTIMA_VENDA && (
          <TableSortableHeader 
            sortKey="DATA_ULTIMA_VENDA" 
            label="Última Venda" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="120px"
            align="center"
          />
        )}
        
        {visibleColumns.RANKING && (
          <TableSortableHeader 
            sortKey="RANKING" 
            label="Ranking" 
            currentSortConfig={sortConfig} 
            onSort={onSort} 
            width="100px"
            align="right"
          />
        )}
      </TableRow>
    </TableHeader>
  );
};

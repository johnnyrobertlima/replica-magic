
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { formatCurrency, formatTableDate, formatTableNumber, formatTablePercentage } from "../utils/formatters";
import { StockTurnoverIndicator } from "./StockTurnoverIndicator";
import { ItemBadges } from "./ItemBadges";

interface StockSalesTableRowProps {
  item: StockItem;
  index: number;
  isGroupedView?: boolean;
  visibleColumns: Record<string, boolean>;
}

export const StockSalesTableRow: React.FC<StockSalesTableRowProps> = ({ 
  item, 
  index,
  isGroupedView = false,
  visibleColumns
}) => {
  const isEven = index % 2 === 0;
  
  return (
    <TableRow className={`${isEven ? 'bg-white' : 'bg-gray-50'} transition-colors hover:bg-gray-100`}>
      {!isGroupedView && (
        <>
          <TableCell className="font-medium whitespace-nowrap sticky left-0 z-20" style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
            <div className="flex items-center">
              <div>{item.ITEM_CODIGO}</div>
              <ItemBadges item={item} />
            </div>
          </TableCell>
          
          <TableCell className="font-medium whitespace-nowrap">
            {item.DESCRICAO}
          </TableCell>
          
          <TableCell className="whitespace-nowrap">
            {item.GRU_DESCRICAO}
          </TableCell>
        </>
      )}
      
      {isGroupedView && (
        <TableCell className="font-medium whitespace-nowrap sticky left-0 z-20" style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
          <div className="flex items-center">
            <div className="mr-1">{item.ITEM_CODIGO}</div>
            <div className="truncate max-w-[180px] text-gray-600">{item.DESCRICAO}</div>
            <ItemBadges item={item} />
          </div>
        </TableCell>
      )}
      
      {visibleColumns.FISICO && (
        <TableCell className="text-right whitespace-nowrap">
          {formatTableNumber(item.FISICO, 0)}
        </TableCell>
      )}
      
      {visibleColumns.DISPONIVEL && (
        <TableCell className="text-right whitespace-nowrap">
          {formatTableNumber(item.DISPONIVEL, 0)}
        </TableCell>
      )}
      
      {visibleColumns.RESERVADO && (
        <TableCell className="text-right whitespace-nowrap">
          {formatTableNumber(item.RESERVADO, 0)}
        </TableCell>
      )}
      
      {visibleColumns.ENTROU && (
        <TableCell className="text-right whitespace-nowrap">
          {formatTableNumber(item.ENTROU || 0, 0)}
        </TableCell>
      )}
      
      {visibleColumns.QTD_VENDIDA && (
        <TableCell className="text-right whitespace-nowrap">
          {formatTableNumber(item.QTD_VENDIDA || 0, 0)}
        </TableCell>
      )}
      
      {visibleColumns.VALOR_TOTAL_VENDIDO && (
        <TableCell className="text-right whitespace-nowrap">
          {formatCurrency(item.VALOR_TOTAL_VENDIDO)}
        </TableCell>
      )}
      
      {visibleColumns.GIRO_ESTOQUE && (
        <TableCell className="text-right whitespace-nowrap">
          <StockTurnoverIndicator turnover={item.GIRO_ESTOQUE} />
        </TableCell>
      )}
      
      {visibleColumns.PERCENTUAL_ESTOQUE_VENDIDO && (
        <TableCell className="text-right whitespace-nowrap">
          {formatTablePercentage(item.PERCENTUAL_ESTOQUE_VENDIDO)}
        </TableCell>
      )}
      
      {visibleColumns.DIAS_COBERTURA && (
        <TableCell className="text-right whitespace-nowrap">
          {item.DIAS_COBERTURA ? Math.round(item.DIAS_COBERTURA).toLocaleString() : '-'}
        </TableCell>
      )}
      
      {visibleColumns.DATA_ULTIMA_VENDA && (
        <TableCell className="text-center whitespace-nowrap">
          {formatTableDate(item.DATA_ULTIMA_VENDA)}
        </TableCell>
      )}
      
      {visibleColumns.RANKING && (
        <TableCell className="text-right whitespace-nowrap">
          {item.RANKING || '-'}
        </TableCell>
      )}
    </TableRow>
  );
};


import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { ItemBadges } from "./ItemBadges";
import { StockTurnoverIndicator } from "./StockTurnoverIndicator";
import { formatTableDate, formatTableNumber, formatTablePercentage } from "../utils/formatters";
import { formatCurrency } from "@/utils/formatters";

interface StockSalesTableRowProps {
  item: StockItem;
}

export const StockSalesTableRow: React.FC<StockSalesTableRowProps> = ({ item }) => {
  const isLowStock = (item.FISICO || 0) < 5;
  const isTop10 = (item.RANKING || 0) > 0 && (item.RANKING || 0) <= 10;
  
  return (
    <TableRow 
      className={`
        ${isLowStock ? 'bg-red-50' : ''}
        ${item.PRODUTO_NOVO ? 'bg-blue-50' : ''}
        ${isTop10 ? 'bg-yellow-50' : ''}
        hover:bg-gray-100 transition-colors
      `}
    >
      <TableCell className="font-medium">
        {item.ITEM_CODIGO}
        <ItemBadges 
          isNew={item.PRODUTO_NOVO} 
          isTop10={isTop10} 
          ranking={item.RANKING} 
        />
      </TableCell>
      <TableCell>{item.DESCRICAO}</TableCell>
      <TableCell>{item.GRU_DESCRICAO}</TableCell>
      <TableCell className={isLowStock ? 'text-red-600 font-bold' : ''}>
        {formatTableNumber(item.FISICO, 0)}
      </TableCell>
      <TableCell>{formatTableNumber(item.DISPONIVEL, 0)}</TableCell>
      <TableCell>{formatTableNumber(item.RESERVADO, 0)}</TableCell>
      <TableCell>{formatTableNumber(item.QTD_VENDIDA, 0)}</TableCell>
      <TableCell>{formatCurrency(item.VALOR_TOTAL_VENDIDO)}</TableCell>
      <TableCell>
        <StockTurnoverIndicator turnover={item.GIRO_ESTOQUE} />
      </TableCell>
      <TableCell>{formatTablePercentage(item.PERCENTUAL_ESTOQUE_VENDIDO)}</TableCell>
      <TableCell>
        {item.DIAS_COBERTURA >= 999 ? '∞' : formatTableNumber(item.DIAS_COBERTURA, 0)}
      </TableCell>
      <TableCell>{formatTableDate(item.DATA_ULTIMA_VENDA)}</TableCell>
      <TableCell>{item.RANKING || '-'}</TableCell>
    </TableRow>
  );
};

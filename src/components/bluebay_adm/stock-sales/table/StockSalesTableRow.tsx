
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { formatCurrency, formatPercentage, formatTableNumber } from "../utils/formatters";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StockSalesTableRowProps {
  item: StockItem;
  index: number;
  isGroupedView?: boolean;
}

export const StockSalesTableRow: React.FC<StockSalesTableRowProps> = ({ 
  item, 
  index,
  isGroupedView = false
}) => {
  // Zebra-striping for better readability
  const isEven = index % 2 === 0;
  const baseClassName = isEven ? "bg-white" : "bg-gray-50";
  const hoverClassName = "hover:bg-gray-100";
  const paddingClassName = isGroupedView ? "pl-10" : ""; // Indent items in grouped view
  
  return (
    <TableRow className={`${baseClassName} ${hoverClassName} transition-colors`}>
      {!isGroupedView && (
        <>
          <TableCell className="font-medium w-[120px]">{item.ITEM_CODIGO}</TableCell>
          <TableCell className="w-[250px]">
            <span className="line-clamp-1" title={item.DESCRICAO || '-'}>
              {item.DESCRICAO || '-'}
            </span>
          </TableCell>
          <TableCell className="w-[150px]">
            <span className="line-clamp-1" title={item.GRU_DESCRICAO || 'Sem Grupo'}>
              {item.GRU_DESCRICAO || 'Sem Grupo'}
            </span>
          </TableCell>
        </>
      )}
      
      {isGroupedView && (
        <TableCell className={`font-medium ${paddingClassName} w-[250px]`}>
          <div className="flex flex-col">
            <span>{item.ITEM_CODIGO}</span>
            <span className="text-sm text-gray-500 truncate" title={item.DESCRICAO || '-'}>
              {item.DESCRICAO || '-'}
            </span>
          </div>
        </TableCell>
      )}
      
      <TableCell className="text-right w-[150px]">{formatTableNumber(item.FISICO || 0)}</TableCell>
      <TableCell className="text-right w-[120px]">{formatTableNumber(item.DISPONIVEL || 0)}</TableCell>
      <TableCell className="text-right w-[120px]">{formatTableNumber(item.RESERVADO || 0)}</TableCell>
      <TableCell className="text-right w-[130px]">{formatTableNumber(item.QTD_VENDIDA || 0)}</TableCell>
      <TableCell className="text-right w-[150px]">{formatCurrency(item.VALOR_TOTAL_VENDIDO || 0)}</TableCell>
      <TableCell className="text-right w-[120px]">{Number(item.GIRO_ESTOQUE || 0).toFixed(2)}</TableCell>
      <TableCell className="text-right w-[120px]">{formatPercentage(item.PERCENTUAL_ESTOQUE_VENDIDO || 0)}</TableCell>
      <TableCell className="text-right w-[140px]">{Number(item.DIAS_COBERTURA || 0).toFixed(0)}</TableCell>
      <TableCell className="text-center w-[130px]">
        {item.DATA_ULTIMA_VENDA ? format(new Date(item.DATA_ULTIMA_VENDA), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
      </TableCell>
      <TableCell className="text-right w-[100px]">{item.RANKING !== null ? Number(item.RANKING).toFixed(0) : '-'}</TableCell>
    </TableRow>
  );
};

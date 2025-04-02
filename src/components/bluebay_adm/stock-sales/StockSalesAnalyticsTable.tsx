
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Star, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { StockItem } from "@/services/bluebay/stockSalesAnalyticsService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatters";

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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "-";
    }
  };

  const formatNumber = (num: number | null, decimals = 2) => {
    if (num === null || num === undefined) return "-";
    return num.toLocaleString('pt-BR', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatPercentage = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    return `${num.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}%`;
  };

  const renderSortIcon = (key: keyof StockItem) => {
    return (
      <ArrowUpDown 
        className={`inline ml-1 h-4 w-4 ${sortConfig.key === key ? 'text-primary' : 'text-gray-400'}`}
      />
    );
  };

  const getSortableHeaderProps = (key: keyof StockItem, label: string) => ({
    className: "cursor-pointer hover:bg-muted/50",
    onClick: () => onSort(key),
    children: (
      <div className="flex items-center">
        {label}
        {renderSortIcon(key)}
      </div>
    )
  });

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <p className="text-xl text-gray-700 mb-2">
          Nenhum dado encontrado para os filtros aplicados.
        </p>
        <p className="text-md text-gray-600 max-w-xl mx-auto">
          Tente ajustar os filtros ou selecionar um período diferente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse min-w-full">
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow>
            <TableHead {...getSortableHeaderProps('ITEM_CODIGO', 'Código')}>
              Código
              {renderSortIcon('ITEM_CODIGO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('DESCRICAO', 'Descrição')}>
              Descrição
              {renderSortIcon('DESCRICAO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('GRU_DESCRICAO', 'Grupo')}>
              Grupo
              {renderSortIcon('GRU_DESCRICAO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('FISICO', 'Estoque Físico')}>
              Estoque Físico
              {renderSortIcon('FISICO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('DISPONIVEL', 'Disponível')}>
              Disponível
              {renderSortIcon('DISPONIVEL')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('RESERVADO', 'Reservado')}>
              Reservado
              {renderSortIcon('RESERVADO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('QTD_VENDIDA', 'Qtd. Vendida')}>
              Qtd. Vendida
              {renderSortIcon('QTD_VENDIDA')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('VALOR_TOTAL_VENDIDO', 'Valor Vendido')}>
              Valor Vendido
              {renderSortIcon('VALOR_TOTAL_VENDIDO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('GIRO_ESTOQUE', 'Giro Estoque')}>
              Giro Estoque
              {renderSortIcon('GIRO_ESTOQUE')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('PERCENTUAL_ESTOQUE_VENDIDO', '% Vendido')}>
              % Vendido
              {renderSortIcon('PERCENTUAL_ESTOQUE_VENDIDO')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('DIAS_COBERTURA', 'Dias Cobertura')}>
              Dias Cobertura
              {renderSortIcon('DIAS_COBERTURA')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('DATA_ULTIMA_VENDA', 'Última Venda')}>
              Última Venda
              {renderSortIcon('DATA_ULTIMA_VENDA')}
            </TableHead>
            <TableHead {...getSortableHeaderProps('RANKING', 'Ranking')}>
              Ranking
              {renderSortIcon('RANKING')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLowStock = (item.FISICO || 0) < 5;
            const isTop10 = (item.RANKING || 0) > 0 && (item.RANKING || 0) <= 10;
            
            return (
              <TableRow 
                key={item.ITEM_CODIGO}
                className={`
                  ${isLowStock ? 'bg-red-50' : ''}
                  ${item.PRODUTO_NOVO ? 'bg-blue-50' : ''}
                  ${isTop10 ? 'bg-yellow-50' : ''}
                  hover:bg-gray-100 transition-colors
                `}
              >
                <TableCell className="font-medium">
                  {item.ITEM_CODIGO}
                  {item.PRODUTO_NOVO && (
                    <Badge className="ml-2 bg-blue-600">Novo</Badge>
                  )}
                  {isTop10 && (
                    <Badge className="ml-2 bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      Top {item.RANKING}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{item.DESCRICAO}</TableCell>
                <TableCell>{item.GRU_DESCRICAO}</TableCell>
                <TableCell className={isLowStock ? 'text-red-600 font-bold' : ''}>
                  {formatNumber(item.FISICO, 0)}
                </TableCell>
                <TableCell>{formatNumber(item.DISPONIVEL, 0)}</TableCell>
                <TableCell>{formatNumber(item.RESERVADO, 0)}</TableCell>
                <TableCell>{formatNumber(item.QTD_VENDIDA, 0)}</TableCell>
                <TableCell>{formatCurrency(item.VALOR_TOTAL_VENDIDO)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {formatNumber(item.GIRO_ESTOQUE)}
                    {item.GIRO_ESTOQUE > 1 ? (
                      <TrendingUp className="ml-1 h-4 w-4 text-green-600" />
                    ) : item.GIRO_ESTOQUE > 0 ? (
                      <TrendingDown className="ml-1 h-4 w-4 text-amber-600" />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{formatPercentage(item.PERCENTUAL_ESTOQUE_VENDIDO)}</TableCell>
                <TableCell>
                  {item.DIAS_COBERTURA >= 999 ? '∞' : formatNumber(item.DIAS_COBERTURA, 0)}
                </TableCell>
                <TableCell>{formatDate(item.DATA_ULTIMA_VENDA)}</TableCell>
                <TableCell>{item.RANKING || '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

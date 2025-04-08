
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepresentativeData } from "@/types/bluebay/dashboardTypes";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface RepresentativeRankingProps {
  data: RepresentativeData | null;
}

type SortKey = 'name' | 'totalOrders' | 'totalBilled' | 'conversionRate' | 'averageTicket';
type SortDir = 'asc' | 'desc';

export const RepresentativeRanking = ({ data }: RepresentativeRankingProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('totalBilled');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  if (!data) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Carregando ranking de representantes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc'); // Default to descending when changing sort key
    }
  };

  const sortedItems = [...data.items].sort((a, b) => {
    if (sortKey === 'name') {
      return sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    const valA = a[sortKey];
    const valB = b[sortKey];
    
    return sortDir === 'asc'
      ? (valA as number) - (valB as number)
      : (valB as number) - (valA as number);
  });

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ranking de Representantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSort('name')}
                >
                  Representante {renderSortIcon('name')}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSort('totalOrders')}
                >
                  Total Pedidos (R$) {renderSortIcon('totalOrders')}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSort('totalBilled')}
                >
                  Total Faturado (R$) {renderSortIcon('totalBilled')}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSort('conversionRate')}
                >
                  Conversão (%) {renderSortIcon('conversionRate')}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleSort('averageTicket')}
                >
                  Ticket Médio (R$) {renderSortIcon('averageTicket')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.totalOrders)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.totalBilled)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`
                      ${item.conversionRate >= 80 ? 'text-green-600' : ''}
                      ${item.conversionRate < 80 && item.conversionRate >= 50 ? 'text-amber-600' : ''}
                      ${item.conversionRate < 50 ? 'text-red-600' : ''}
                    `}>
                      {item.conversionRate.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.averageTicket)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

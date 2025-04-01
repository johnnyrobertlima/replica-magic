
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstoqueItem } from '@/types/bk/estoque';

interface ReportsSummaryProps {
  items: EstoqueItem[];
}

export const ReportsSummary: React.FC<ReportsSummaryProps> = ({ items }) => {
  const uniqueGroups = new Set(items.map(item => item.GRU_DESCRICAO));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{items.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueGroups.size}</div>
        </CardContent>
      </Card>
    </div>
  );
};

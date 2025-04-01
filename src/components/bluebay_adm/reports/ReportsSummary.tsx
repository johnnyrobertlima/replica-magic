
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstoqueItem } from "@/types/bk/estoque";

interface ReportsSummaryProps {
  items: EstoqueItem[];
}

export const ReportsSummary: React.FC<ReportsSummaryProps> = ({ items }) => {
  const summary = useMemo(() => {
    return {
      totalItems: items.length,
      totalFisico: items.reduce((sum, item) => sum + (item.FISICO || 0), 0),
      totalDisponivel: items.reduce((sum, item) => sum + (item.DISPONIVEL || 0), 0),
      uniqueGroups: new Set(items.map(item => item.GRU_DESCRICAO)).size
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalItems}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estoque Físico Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalFisico.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estoque Disponível Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalDisponivel.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Grupos de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.uniqueGroups}</div>
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface FaturamentoItem {
  DATA_EMISSAO?: string | Date;
  NOTA?: string;
  ITEM_CODIGO?: string;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_TOTAL?: number;
}

interface GroupedFaturamento {
  NOTA: string;
  DATA_EMISSAO: string | Date;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  items: FaturamentoItem[];
}

interface FaturamentoTableProps {
  faturamentoData: FaturamentoItem[];
  isLoading: boolean;
}

export const FaturamentoTable: React.FC<FaturamentoTableProps> = ({ faturamentoData, isLoading }) => {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Agrupar faturamento por nota
  const groupedByNote: Record<string, GroupedFaturamento> = {};
  
  faturamentoData.forEach(item => {
    if (!item.NOTA) return;
    
    const nota = item.NOTA;
    const valorTotal = (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
    
    if (!groupedByNote[nota]) {
      groupedByNote[nota] = {
        NOTA: nota,
        DATA_EMISSAO: item.DATA_EMISSAO || '',
        TOTAL_QUANTIDADE: 0,
        TOTAL_VALOR: 0,
        items: []
      };
    }
    
    // Adicionar aos totais
    groupedByNote[nota].TOTAL_QUANTIDADE += (item.QUANTIDADE || 0);
    groupedByNote[nota].TOTAL_VALOR += valorTotal;
    
    // Adicionar o item à lista
    groupedByNote[nota].items.push({
      ...item,
      VALOR_TOTAL: valorTotal
    });
  });
  
  // Converter o objeto em array
  const groupedFaturamento = Object.values(groupedByNote).sort((a, b) => {
    const dateA = new Date(a.DATA_EMISSAO).getTime();
    const dateB = new Date(b.DATA_EMISSAO).getTime();
    return dateB - dateA; // Ordenar por data mais recente primeiro
  });

  const toggleNote = (nota: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nota)) {
        newSet.delete(nota);
      } else {
        newSet.add(nota);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <Card className="p-4 mt-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
        </div>
      </Card>
    );
  }

  if (groupedFaturamento.length === 0) {
    return (
      <Card className="p-4 mt-6">
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma nota fiscal encontrada para o período selecionado
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Notas Fiscais Emitidas</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead className="text-right">Quantidade Total</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedFaturamento.map((group) => (
              <React.Fragment key={group.NOTA}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleNote(group.NOTA)}
                >
                  <TableCell>
                    {expandedNotes.has(group.NOTA) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell>
                    {group.DATA_EMISSAO instanceof Date || typeof group.DATA_EMISSAO === 'string'
                      ? format(new Date(group.DATA_EMISSAO), 'dd/MM/yyyy', { locale: ptBR })
                      : 'Data inválida'}
                  </TableCell>
                  <TableCell className="font-medium">{group.NOTA}</TableCell>
                  <TableCell className="text-right">{group.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(group.TOTAL_VALOR)}</TableCell>
                </TableRow>
                
                {/* Linhas de detalhes dos itens */}
                {expandedNotes.has(group.NOTA) && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0 bg-muted/30">
                      <div className="p-4">
                        <h4 className="font-medium mb-2">Itens da Nota {group.NOTA}</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Código Item</TableHead>
                              <TableHead className="text-right">Quantidade</TableHead>
                              <TableHead className="text-right">Valor Unitário</TableHead>
                              <TableHead className="text-right">Valor Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.items.map((item, idx) => (
                              <TableRow key={`${item.NOTA}-${item.ITEM_CODIGO}-${idx}`}>
                                <TableCell>{item.ITEM_CODIGO || '-'}</TableCell>
                                <TableCell className="text-right">{item.QUANTIDADE?.toLocaleString('pt-BR') || '-'}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.VALOR_UNITARIO || 0)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.VALOR_TOTAL || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};


import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle, ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";
import { differenceInDays } from "date-fns";

interface CobrancaTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
  onClientSelect: (clientCode: string) => void;
}

export const CobrancaTable: React.FC<CobrancaTableProps> = ({ 
  titles, 
  isLoading,
  onClientSelect
}) => {
  const [expandedClients, setExpandedClients] = useState<Set<string | number>>(new Set());

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  // Filter only overdue titles (DTVENCIMENTO < today and STATUS is not "paid")
  const overdueUnpaidTitles = titles.filter(title => {
    const isPaid = title.STATUS === '3'; // Status 3 = Paid
    const isCanceled = title.STATUS === '4'; // Status 4 = Canceled
    const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
    const isOverdue = vencimentoDate && vencimentoDate < new Date();
    
    return !isPaid && !isCanceled && isOverdue && title.VLRSALDO > 0;
  });

  if (overdueUnpaidTitles.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum título vencido encontrado</p>
        <p className="text-sm text-muted-foreground">Todos os títulos estão pagos ou dentro do prazo</p>
      </div>
    );
  }

  // Group by client and calculate totals
  const clientSummaries: Record<string | number, ClientDebtSummary> = {};
  
  overdueUnpaidTitles.forEach(title => {
    const clientKey = String(title.PES_CODIGO);
    
    if (!clientSummaries[clientKey]) {
      clientSummaries[clientKey] = {
        PES_CODIGO: title.PES_CODIGO,
        CLIENTE_NOME: title.CLIENTE_NOME,
        TOTAL_SALDO: 0,
        DIAS_VENCIDO_MEDIO: 0,
        QUANTIDADE_TITULOS: 0,
        VALOR_TOTAL: 0
      };
    }
    
    const summary = clientSummaries[clientKey];
    summary.TOTAL_SALDO += title.VLRSALDO;
    summary.VALOR_TOTAL += title.VLRTITULO;
    summary.QUANTIDADE_TITULOS++;
    
    // Calculate days overdue
    if (title.DTVENCIMENTO) {
      const vencimentoDate = new Date(title.DTVENCIMENTO);
      const diasVencido = differenceInDays(new Date(), vencimentoDate);
      summary.DIAS_VENCIDO_MEDIO += diasVencido;
    }
  });
  
  // Calculate average days overdue
  Object.values(clientSummaries).forEach(summary => {
    if (summary.QUANTIDADE_TITULOS > 0) {
      summary.DIAS_VENCIDO_MEDIO = Math.round(summary.DIAS_VENCIDO_MEDIO / summary.QUANTIDADE_TITULOS);
    }
  });
  
  // Convert to array and sort by total balance descending
  const sortedClientSummaries = Object.values(clientSummaries).sort((a, b) => 
    b.TOTAL_SALDO - a.TOTAL_SALDO
  );

  const toggleClientExpand = (clientCode: string | number) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientCode)) {
        newSet.delete(clientCode);
      } else {
        newSet.add(clientCode);
      }
      return newSet;
    });
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Código Cliente</TableHead>
            <TableHead>Nome Cliente</TableHead>
            <TableHead>Qtd. Títulos</TableHead>
            <TableHead>Dias Vencidos (média)</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Saldo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClientSummaries.map((summary) => {
            const isExpanded = expandedClients.has(summary.PES_CODIGO);
            const clientTitles = overdueUnpaidTitles.filter(
              title => String(title.PES_CODIGO) === String(summary.PES_CODIGO)
            );
            
            return (
              <React.Fragment key={summary.PES_CODIGO}>
                <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => toggleClientExpand(summary.PES_CODIGO)}>
                  <TableCell>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </TableCell>
                  <TableCell>{summary.PES_CODIGO}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={summary.CLIENTE_NOME}>
                    {summary.CLIENTE_NOME}
                  </TableCell>
                  <TableCell>{summary.QUANTIDADE_TITULOS}</TableCell>
                  <TableCell className="text-amber-600 font-medium">{summary.DIAS_VENCIDO_MEDIO} dias</TableCell>
                  <TableCell>{formatCurrency(summary.VALOR_TOTAL)}</TableCell>
                  <TableCell className="text-red-600 font-medium">{formatCurrency(summary.TOTAL_SALDO)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientSelect(String(summary.PES_CODIGO));
                      }}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Ver Títulos
                    </Button>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={8} className="p-0">
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-2">Detalhes dos Títulos</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nota Fiscal</TableHead>
                              <TableHead>Nº Documento</TableHead>
                              <TableHead>Data Emissão</TableHead>
                              <TableHead>Data Vencimento</TableHead>
                              <TableHead>Dias Vencido</TableHead>
                              <TableHead>Valor Total</TableHead>
                              <TableHead>Valor Saldo</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientTitles.map((title) => {
                              const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
                              const diasVencido = vencimentoDate ? differenceInDays(new Date(), vencimentoDate) : 0;
                              
                              return (
                                <TableRow key={`${title.NUMNOTA}-${title.NUMDOCUMENTO || ''}`}>
                                  <TableCell>{title.NUMNOTA}</TableCell>
                                  <TableCell>{title.NUMDOCUMENTO || '-'}</TableCell>
                                  <TableCell>{new Date(title.DTEMISSAO).toLocaleDateString()}</TableCell>
                                  <TableCell>{vencimentoDate?.toLocaleDateString() || '-'}</TableCell>
                                  <TableCell className="text-red-600">{diasVencido} dias</TableCell>
                                  <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
                                  <TableCell className="text-red-600 font-medium">{formatCurrency(title.VLRSALDO)}</TableCell>
                                  <TableCell>
                                    {title.STATUS === '1' && 'Em Aberto'}
                                    {title.STATUS === '2' && 'Parcial'}
                                    {title.STATUS === '3' && 'Pago'}
                                    {title.STATUS === '4' && 'Cancelado'}
                                    {!['1', '2', '3', '4'].includes(title.STATUS) && title.STATUS}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

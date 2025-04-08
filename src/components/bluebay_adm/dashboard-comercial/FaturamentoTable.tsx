
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GroupedFaturamento {
  DATA_EMISSAO: string | Date;
  notas: {
    NOTA: string;
    DATA_EMISSAO: string | Date;
    TOTAL_QUANTIDADE: number;
    TOTAL_VALOR: number;
    items: FaturamentoItem[];
  }[];
}

interface GroupedPedido {
  DATA_PEDIDO: string | Date;
  pedidos: {
    PED_NUMPEDIDO: string;
    PED_ANOBASE: number;
    DATA_PEDIDO: string | Date;
    TOTAL_QUANTIDADE: number;
    TOTAL_VALOR: number;
    items: PedidoItem[];
  }[];
}

interface FaturamentoTableProps {
  faturamentoData: FaturamentoItem[];
  pedidoData: PedidoItem[];
  isLoading: boolean;
}

export const FaturamentoTable: React.FC<FaturamentoTableProps> = ({ faturamentoData, pedidoData, isLoading }) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [expandedPedidoDates, setExpandedPedidoDates] = useState<Set<string>>(new Set());
  const [expandedPedidos, setExpandedPedidos] = useState<Set<string>>(new Set());

  // Agrupar faturamento por data e nota
  const groupedByDate: Record<string, GroupedFaturamento> = {};
  
  faturamentoData.forEach(item => {
    if (!item.DATA_EMISSAO || !item.NOTA) return;
    
    const dateStr = typeof item.DATA_EMISSAO === 'string' 
      ? format(parseISO(item.DATA_EMISSAO), 'yyyy-MM-dd')
      : format(item.DATA_EMISSAO, 'yyyy-MM-dd');
    
    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = {
        DATA_EMISSAO: item.DATA_EMISSAO,
        notas: []
      };
    }

    // Verificar se já temos essa nota no grupo da data
    const notaExistente = groupedByDate[dateStr].notas.find(n => n.NOTA === item.NOTA);
    
    if (notaExistente) {
      notaExistente.TOTAL_QUANTIDADE += (item.QUANTIDADE || 0);
      notaExistente.TOTAL_VALOR += (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0);
      notaExistente.items.push(item);
    } else {
      groupedByDate[dateStr].notas.push({
        NOTA: item.NOTA,
        DATA_EMISSAO: item.DATA_EMISSAO,
        TOTAL_QUANTIDADE: item.QUANTIDADE || 0,
        TOTAL_VALOR: (item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0),
        items: [item]
      });
    }
  });
  
  // Converter para array e ordenar por data (mais recente primeiro)
  const groupedFaturamentos = Object.values(groupedByDate).sort((a, b) => {
    const dateA = new Date(a.DATA_EMISSAO).getTime();
    const dateB = new Date(b.DATA_EMISSAO).getTime();
    return dateB - dateA;
  });

  // Agrupar pedidos por data e número de pedido
  const groupedPedidoByDate: Record<string, GroupedPedido> = {};
  
  pedidoData.forEach(item => {
    if (!item.DATA_PEDIDO || !item.PED_NUMPEDIDO) return;
    
    const dateStr = typeof item.DATA_PEDIDO === 'string' 
      ? format(parseISO(item.DATA_PEDIDO), 'yyyy-MM-dd')
      : format(item.DATA_PEDIDO, 'yyyy-MM-dd');
    
    if (!groupedPedidoByDate[dateStr]) {
      groupedPedidoByDate[dateStr] = {
        DATA_PEDIDO: item.DATA_PEDIDO,
        pedidos: []
      };
    }

    // Criar key única para o pedido
    const pedidoKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
    
    // Verificar se já temos esse pedido no grupo da data
    const pedidoExistente = groupedPedidoByDate[dateStr].pedidos.find(
      p => `${p.PED_NUMPEDIDO}-${p.PED_ANOBASE}` === pedidoKey
    );
    
    if (pedidoExistente) {
      pedidoExistente.TOTAL_QUANTIDADE += (item.QTDE_PEDIDA || 0);
      pedidoExistente.TOTAL_VALOR += (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
      pedidoExistente.items.push(item);
    } else {
      groupedPedidoByDate[dateStr].pedidos.push({
        PED_NUMPEDIDO: item.PED_NUMPEDIDO,
        PED_ANOBASE: item.PED_ANOBASE,
        DATA_PEDIDO: item.DATA_PEDIDO,
        TOTAL_QUANTIDADE: item.QTDE_PEDIDA || 0,
        TOTAL_VALOR: (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0),
        items: [item]
      });
    }
  });
  
  // Converter para array e ordenar por data (mais recente primeiro)
  const groupedPedidos = Object.values(groupedPedidoByDate).sort((a, b) => {
    const dateA = new Date(a.DATA_PEDIDO).getTime();
    const dateB = new Date(b.DATA_PEDIDO).getTime();
    return dateB - dateA;
  });

  const toggleDate = (dateStr: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

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

  const togglePedidoDate = (dateStr: string) => {
    setExpandedPedidoDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

  const togglePedido = (pedidoKey: string) => {
    setExpandedPedidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pedidoKey)) {
        newSet.delete(pedidoKey);
      } else {
        newSet.add(pedidoKey);
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

  return (
    <Card className="p-4 mt-6">
      <Tabs defaultValue="faturamento">
        <TabsList className="mb-4">
          <TabsTrigger value="faturamento">Notas Fiscais Emitidas</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faturamento">
          <h2 className="text-xl font-semibold mb-4">Notas Fiscais Emitidas</h2>
          {groupedFaturamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma nota fiscal encontrada para o período selecionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead className="text-right">Total de Notas</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedFaturamentos.map((dateGroup) => {
                    const dateStr = typeof dateGroup.DATA_EMISSAO === 'string'
                      ? dateGroup.DATA_EMISSAO
                      : format(dateGroup.DATA_EMISSAO, 'yyyy-MM-dd');
                    
                    const totalNotas = dateGroup.notas.length;
                    const totalValor = dateGroup.notas.reduce((sum, nota) => sum + nota.TOTAL_VALOR, 0);
                    
                    return (
                      <React.Fragment key={dateStr}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleDate(dateStr)}
                        >
                          <TableCell>
                            {expandedDates.has(dateStr) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {typeof dateGroup.DATA_EMISSAO === 'string' 
                              ? format(parseISO(dateGroup.DATA_EMISSAO), 'dd/MM/yyyy', { locale: ptBR })
                              : format(dateGroup.DATA_EMISSAO, 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">{totalNotas}</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalValor)}</TableCell>
                        </TableRow>
                        
                        {expandedDates.has(dateStr) && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0 bg-muted/30">
                              <div className="px-4 py-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-10"></TableHead>
                                      <TableHead>Nota</TableHead>
                                      <TableHead className="text-right">Quantidade Total</TableHead>
                                      <TableHead className="text-right">Valor Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {dateGroup.notas.map((nota) => {
                                      const notaKey = nota.NOTA;
                                      
                                      return (
                                        <React.Fragment key={notaKey}>
                                          <TableRow 
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleNote(notaKey)}
                                          >
                                            <TableCell>
                                              {expandedNotes.has(notaKey) ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                            </TableCell>
                                            <TableCell className="font-medium">{nota.NOTA}</TableCell>
                                            <TableCell className="text-right">{nota.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(nota.TOTAL_VALOR)}</TableCell>
                                          </TableRow>
                                          
                                          {expandedNotes.has(notaKey) && (
                                            <TableRow>
                                              <TableCell colSpan={4} className="p-0 bg-muted/20">
                                                <div className="p-4">
                                                  <h4 className="font-medium mb-2">Itens da Nota {nota.NOTA}</h4>
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
                                                      {nota.items.map((item, idx) => (
                                                        <TableRow key={`${nota.NOTA}-${item.ITEM_CODIGO}-${idx}`}>
                                                          <TableCell>{item.ITEM_CODIGO || '-'}</TableCell>
                                                          <TableCell className="text-right">{item.QUANTIDADE?.toLocaleString('pt-BR') || '-'}</TableCell>
                                                          <TableCell className="text-right">{formatCurrency(item.VALOR_UNITARIO || 0)}</TableCell>
                                                          <TableCell className="text-right">
                                                            {formatCurrency((item.QUANTIDADE || 0) * (item.VALOR_UNITARIO || 0))}
                                                          </TableCell>
                                                        </TableRow>
                                                      ))}
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
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pedidos">
          <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
          {groupedPedidos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido encontrado para o período selecionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Data Pedido</TableHead>
                    <TableHead className="text-right">Total de Pedidos</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedPedidos.map((dateGroup) => {
                    const dateStr = typeof dateGroup.DATA_PEDIDO === 'string'
                      ? dateGroup.DATA_PEDIDO
                      : format(dateGroup.DATA_PEDIDO, 'yyyy-MM-dd');
                    
                    const totalPedidos = dateGroup.pedidos.length;
                    const totalValor = dateGroup.pedidos.reduce((sum, pedido) => sum + pedido.TOTAL_VALOR, 0);
                    
                    return (
                      <React.Fragment key={dateStr}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => togglePedidoDate(dateStr)}
                        >
                          <TableCell>
                            {expandedPedidoDates.has(dateStr) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {typeof dateGroup.DATA_PEDIDO === 'string' 
                              ? format(parseISO(dateGroup.DATA_PEDIDO), 'dd/MM/yyyy', { locale: ptBR })
                              : format(dateGroup.DATA_PEDIDO, 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">{totalPedidos}</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalValor)}</TableCell>
                        </TableRow>
                        
                        {expandedPedidoDates.has(dateStr) && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0 bg-muted/30">
                              <div className="px-4 py-2">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-10"></TableHead>
                                      <TableHead>Nº Pedido</TableHead>
                                      <TableHead>Ano</TableHead>
                                      <TableHead className="text-right">Quantidade Total</TableHead>
                                      <TableHead className="text-right">Valor Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {dateGroup.pedidos.map((pedido) => {
                                      const pedidoKey = `${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}`;
                                      
                                      return (
                                        <React.Fragment key={pedidoKey}>
                                          <TableRow 
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => togglePedido(pedidoKey)}
                                          >
                                            <TableCell>
                                              {expandedPedidos.has(pedidoKey) ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                            </TableCell>
                                            <TableCell className="font-medium">{pedido.PED_NUMPEDIDO}</TableCell>
                                            <TableCell>{pedido.PED_ANOBASE}</TableCell>
                                            <TableCell className="text-right">{pedido.TOTAL_QUANTIDADE.toLocaleString('pt-BR')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(pedido.TOTAL_VALOR)}</TableCell>
                                          </TableRow>
                                          
                                          {expandedPedidos.has(pedidoKey) && (
                                            <TableRow>
                                              <TableCell colSpan={5} className="p-0 bg-muted/20">
                                                <div className="p-4">
                                                  <h4 className="font-medium mb-2">
                                                    Itens do Pedido {pedido.PED_NUMPEDIDO}/{pedido.PED_ANOBASE}
                                                  </h4>
                                                  <Table>
                                                    <TableHeader>
                                                      <TableRow>
                                                        <TableHead>Código Item</TableHead>
                                                        <TableHead className="text-right">Qtd. Pedida</TableHead>
                                                        <TableHead className="text-right">Qtd. Entregue</TableHead>
                                                        <TableHead className="text-right">Qtd. Saldo</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Centro Custo</TableHead>
                                                        <TableHead className="text-right">Valor Unitário</TableHead>
                                                        <TableHead className="text-right">Valor Total</TableHead>
                                                      </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                      {pedido.items.map((item, idx) => {
                                                        const totalItem = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
                                                        const statusMap: Record<string, string> = {
                                                          '0': 'Bloqueado',
                                                          '1': 'Em Aberto',
                                                          '2': 'Parcial',
                                                          '3': 'Total',
                                                          '4': 'Cancelado'
                                                        };
                                                        
                                                        return (
                                                          <TableRow key={`${pedidoKey}-${item.ITEM_CODIGO}-${idx}`}>
                                                            <TableCell>{item.ITEM_CODIGO || '-'}</TableCell>
                                                            <TableCell className="text-right">
                                                              {item.QTDE_PEDIDA?.toLocaleString('pt-BR') || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                              {item.QTDE_ENTREGUE?.toLocaleString('pt-BR') || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                              {item.QTDE_SALDO?.toLocaleString('pt-BR') || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                              {item.STATUS ? statusMap[item.STATUS] || item.STATUS : '-'}
                                                            </TableCell>
                                                            <TableCell>{item.CENTROCUSTO || '-'}</TableCell>
                                                            <TableCell className="text-right">
                                                              {formatCurrency(item.VALOR_UNITARIO || 0)}
                                                            </TableCell>
                                                            <TableCell className="text-right">{formatCurrency(totalItem)}</TableCell>
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
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

import { Loader2, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import { ApprovedOrdersCockpit } from "@/components/jab-orders/ApprovedOrdersCockpit";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { MonthFilterSelect } from "@/components/jab-orders/MonthFilterSelect";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

const AcompanhamentoFaturamento = () => {
  const { 
    approvedOrders, 
    isLoading, 
    calculateTotals, 
    addApprovedOrder,
    handleMonthSelect,
    selectedYear,
    selectedMonth
  } = useApprovedOrders();
  
  const { toast } = useToast();
  
  const [totals, setTotals] = useState({
    valorTotal: 0,
    quantidadeItens: 0,
    quantidadePedidos: 0,
    valorFaltaFaturar: 0,
    valorFaturado: 0
  });

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  useEffect(() => {
    const updateTotals = async () => {
      const calculatedTotals = calculateTotals();
      setTotals(calculatedTotals);
    };
    
    if (!isLoading) {
      updateTotals();
    }
  }, [isLoading, approvedOrders, calculateTotals]);
  
  const formattedMonth = format(
    new Date(selectedYear, selectedMonth - 1, 1),
    "MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const handleExpandToggle = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleExportCard = (order: any) => {
    try {
      const clienteData = order.clienteData;
      const approvedSeparacao = order.clienteData.separacoes.find(
        sep => sep.id === order.separacaoId
      );

      if (!approvedSeparacao) {
        toast({
          title: "Erro na exportação",
          description: "Não foi possível encontrar os dados para exportação",
          variant: "destructive"
        });
        return;
      }

      let approvalDate;
      if (order.approvedAt && typeof order.approvedAt.toLocaleString === 'function') {
        approvalDate = order.approvedAt;
      } else if (order.approvedAt && order.approvedAt._type === 'Date' && order.approvedAt.value) {
        approvalDate = new Date(order.approvedAt.value.iso || order.approvedAt.value.value);
      } else {
        approvalDate = new Date();
      }

      const clientInfo = {
        'Cliente': clienteData.APELIDO || 'N/A',
        'Código Cliente': clienteData.PES_CODIGO || 'N/A',
        'Representante': clienteData.representanteNome || 'N/A',
        'Volume Saudável': clienteData.volumeSaudavel ? formatCurrency(clienteData.volumeSaudavel) : 'N/A',
        'Valores Totais': formatCurrency(clienteData.valoresTotais),
        'Valores em Aberto': formatCurrency(clienteData.valoresEmAberto),
        'Valores Vencidos': formatCurrency(clienteData.valoresVencidos),
        'Data de Aprovação': approvalDate.toLocaleString('pt-BR')
      };

      if (!approvedSeparacao.separacao_itens || approvedSeparacao.separacao_itens.length === 0) {
        toast({
          title: "Sem itens para exportar",
          description: "Este pedido não contém itens para exportação",
          variant: "destructive"
        });
        return;
      }

      const items = approvedSeparacao.separacao_itens.map((item: any) => ({
        'Pedido': item.pedido,
        'Código do Item': item.ITEM_CODIGO || item.item_codigo,
        'Descrição': item.DESCRICAO || item.descricao || 'N/A',
        'Quantidade Pedida': item.QTDE_PEDIDA || item.quantidade_pedida || 0,
        'Quantidade Saldo': item.QTDE_SALDO || 1,
        'Valor Unitário': formatCurrency(item.VALOR_UNITARIO || item.valor_unitario || 0),
        'Valor Total': formatCurrency((item.QTDE_SALDO || 1) * (item.VALOR_UNITARIO || item.valor_unitario || 0))
      }));

      const clientHeaders = Object.keys(clientInfo);
      const itemHeaders = Object.keys(items[0] || {});

      const csvContent = [
        'INFORMAÇÕES DO CLIENTE',
        clientHeaders.map(header => `"${header}"`).join(','),
        Object.values(clientInfo).map(value => `"${value}"`).join(','),
        '',
        'ITENS DO PEDIDO',
        itemHeaders.map(header => `"${header}"`).join(','),
        ...items.map(item => 
          Object.values(item).map(value => `"${value}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const formattedDate = format(approvalDate, 'dd-MM-yyyy');
      link.setAttribute('download', `pedido-${clienteData.APELIDO || 'cliente'}-${formattedDate}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <JabNavMenu />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Acompanhamento de Faturamento</h1>
            <p className="text-muted-foreground mt-1">
              Pedidos aprovados em <span className="font-medium">{formattedMonth}</span>
            </p>
          </div>
          
          <MonthFilterSelect onMonthSelect={handleMonthSelect} />
        </div>
        
        <ApprovedOrdersCockpit 
          valorTotal={totals.valorTotal}
          quantidadeItens={totals.quantidadeItens}
          quantidadePedidos={totals.quantidadePedidos}
          valorFaltaFaturar={totals.valorFaltaFaturar}
          valorFaturado={totals.valorFaturado}
        />
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pedidos Aprovados</h2>
          <p className="text-sm text-muted-foreground">
            Total de {approvedOrders.length} {approvedOrders.length === 1 ? 'pedido aprovado' : 'pedidos aprovados'}
          </p>
        </div>
        
        {approvedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedOrders.map((order) => {
              const approvedSeparacao = order.clienteData.separacoes.find(
                sep => sep.id === order.separacaoId
              );
              
              if (!approvedSeparacao) return null;
              
              const clienteWithApprovedSeparacao = {
                ...order.clienteData,
                separacoes: [approvedSeparacao]
              };
              
              const isExpanded = expandedCard === order.separacaoId;
              
              return (
                <Card 
                  key={order.separacaoId} 
                  className={`border-l-4 border-l-green-500 shadow-md ${isExpanded ? 'col-span-full' : ''}`}
                >
                  <CardHeader className="pb-0 pt-4 px-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {order.clienteData.APELIDO || 'Cliente sem nome'}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Aprovado em: {order.approvedAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportCard(order)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Exportar
                        </Button>
                        <div 
                          className="bg-green-100 text-green-800 font-medium py-1 px-3 rounded-full text-xs cursor-pointer"
                          onClick={() => handleExpandToggle(order.separacaoId)}
                        >
                          {isExpanded ? 'Recolher' : 'Expandir'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <ClienteFinanceiroCard
                      cliente={clienteWithApprovedSeparacao}
                      onUpdateVolumeSaudavel={() => Promise.resolve({ success: true })}
                      onHideCard={() => {}}
                      onApprove={() => {}}
                      expandedView={isExpanded}
                      showApprovalButtons={false}
                    />
                    
                    {approvedSeparacao.separacao_itens && approvedSeparacao.separacao_itens.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                          <FileText className="h-4 w-4" /> 
                          Pedidos incluídos:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(approvedSeparacao.separacao_itens.map(item => item.pedido))).map((pedido, index) => (
                            <span key={`pedido-${index}`} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {String(pedido)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="col-span-2">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-2">
                Nenhum pedido aprovado para faturamento neste período.
              </p>
              <p className="text-sm text-muted-foreground">
                Aprove pedidos na página de aprovação financeira para visualizá-los aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </main>
  );
};

export default AcompanhamentoFaturamento;

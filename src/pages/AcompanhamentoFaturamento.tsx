
import { Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import { ApprovedOrdersCockpit } from "@/components/jab-orders/ApprovedOrdersCockpit";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { MonthFilterSelect } from "@/components/jab-orders/MonthFilterSelect";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { EmptyPendingApprovals } from "@/components/jab-orders/EmptyPendingApprovals";

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
              if (!order || !order.clienteData) return null;
              
              const approvedSeparacao = order.clienteData.separacoes && 
                order.clienteData.separacoes.length > 0 ? 
                order.clienteData.separacoes.find(
                  sep => sep && sep.id === order.separacaoId
                ) : null;
              
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
                          Aprovado em: {new Date(order.approvedAt).toLocaleString('pt-BR')}
                        </p>
                        {order.userEmail && (
                          <p className="text-xs text-gray-500">
                            Por: {order.userEmail} ({order.action === 'approved' ? 'Aprovado' : 'Reprovado'})
                          </p>
                        )}
                      </div>
                      <div 
                        className="bg-green-100 text-green-800 font-medium py-1 px-3 rounded-full text-xs cursor-pointer"
                        onClick={() => handleExpandToggle(order.separacaoId)}
                      >
                        {isExpanded ? 'Recolher' : 'Expandir'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <ClienteFinanceiroCard
                      cliente={clienteWithApprovedSeparacao}
                      onUpdateVolumeSaudavel={() => Promise.resolve({ success: true })}
                      onHideCard={() => {}}
                      onApprove={() => {}}
                      onReject={() => {}}
                      expandedView={isExpanded}
                      showApprovalButtons={false}
                    />
                    
                    {approvedSeparacao.separacao_itens_flat && approvedSeparacao.separacao_itens_flat.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                          <FileText className="h-4 w-4" /> 
                          Pedidos incluídos:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(
                            new Set(
                              approvedSeparacao.separacao_itens_flat
                                .filter(item => item && item.pedido)
                                .map(item => item.pedido)
                            )
                          ).map((pedido, index) => (
                            <span key={`pedido-${index}`} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {String(pedido)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyPendingApprovals />
        )}
      </div>
      <Toaster />
    </main>
  );
};

export default AcompanhamentoFaturamento;

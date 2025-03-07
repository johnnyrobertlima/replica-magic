
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useApprovedOrders } from "@/hooks/useApprovedOrders";
import { ApprovedOrdersCockpit } from "@/components/jab-orders/ApprovedOrdersCockpit";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { formatCurrency } from "@/lib/utils";

const AcompanhamentoFaturamento = () => {
  const { approvedOrders, isLoading, calculateTotals, addApprovedOrder } = useApprovedOrders();
  const { valorTotal, quantidadeItens, quantidadePedidos } = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Acompanhamento de Faturamento</h1>
        <p className="text-muted-foreground">
          Acompanhe os pedidos aprovados para faturamento e monitore o valor total aprovado.
        </p>
        
        {/* Cockpit de métricas */}
        <ApprovedOrdersCockpit 
          valorTotal={valorTotal}
          quantidadeItens={quantidadeItens}
          quantidadePedidos={quantidadePedidos}
        />
        
        <h2 className="text-2xl font-bold mt-8">Pedidos Aprovados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedOrders.length > 0 ? (
            approvedOrders.map((order) => {
              // Find the specific separação that was approved
              const approvedSeparacao = order.clienteData.separacoes.find(
                sep => sep.id === order.separacaoId
              );
              
              if (!approvedSeparacao) return null;
              
              // Create a modified cliente object with only the approved separação
              const clienteWithApprovedSeparacao = {
                ...order.clienteData,
                separacoes: [approvedSeparacao]
              };
              
              return (
                <Card key={order.separacaoId} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Aprovado em: {order.approvedAt.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-green-100 text-green-800 font-medium py-1 px-2 rounded-full text-xs">
                        Aprovado
                      </div>
                    </div>
                    
                    <ClienteFinanceiroCard
                      cliente={clienteWithApprovedSeparacao}
                      onUpdateVolumeSaudavel={() => Promise.resolve({ success: true })}
                      onHideCard={() => {}}
                      onApprove={() => {}}
                    />
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-2">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Nenhum pedido aprovado para faturamento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </main>
  );
};

export default AcompanhamentoFaturamento;

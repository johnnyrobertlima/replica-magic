
import { Card, CardContent } from "@/components/ui/card";
import { ClienteFinanceiro } from "@/types/financialClient";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface ApprovedOrdersListProps {
  approvedOrders: any[];
  expandedCard: string | null;
  onExpandToggle: (id: string) => void;
  onExportCard: (order: any) => void;
}

export const ApprovedOrdersList = ({ 
  approvedOrders,
  expandedCard,
  onExpandToggle,
  onExportCard
}: ApprovedOrdersListProps) => {
  return (
    <div className="space-y-4">
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
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {order.clienteData.APELIDO || 'Cliente sem nome'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Aprovado em: {order.approvedAt.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportCard(order)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                      <div 
                        className="bg-green-100 text-green-800 font-medium py-1 px-3 rounded-full text-xs cursor-pointer"
                        onClick={() => onExpandToggle(order.separacaoId)}
                      >
                        {isExpanded ? 'Recolher' : 'Expandir'}
                      </div>
                    </div>
                  </div>

                  <ClienteFinanceiroCard
                    cliente={clienteWithApprovedSeparacao}
                    onUpdateVolumeSaudavel={() => Promise.resolve({ success: true })}
                    onHideCard={() => {}}
                    onApprove={() => {}}
                    expandedView={isExpanded}
                    showApprovalButtons={false}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
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
  );
};

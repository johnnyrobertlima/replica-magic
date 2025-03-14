
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { formatCurrency } from "@/lib/utils";
import { PedidosIncluidos } from "./PedidosIncluidos";

interface ApprovedOrderCardProps {
  order: any;
  onExport: (orderId: string) => void;
}

export const ApprovedOrderCard = ({ order, onExport }: ApprovedOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 flex items-center gap-1 text-xs"
              onClick={() => onExport(order.separacaoId)}
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
            <div 
              className="bg-green-100 text-green-800 font-medium py-1 px-3 rounded-full text-xs cursor-pointer"
              onClick={handleExpandToggle}
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
          onReject={() => {}}
          expandedView={isExpanded}
          showApprovalButtons={false}
        />
        
        <PedidosIncluidos approvedSeparacao={approvedSeparacao} />
      </CardContent>
    </Card>
  );
};

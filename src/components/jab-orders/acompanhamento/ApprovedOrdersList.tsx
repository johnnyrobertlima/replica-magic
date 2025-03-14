import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { ClienteFinanceiroCard } from "@/components/jab-orders/ClienteFinanceiroCard";
import { EmptyPendingApprovals } from "@/components/jab-orders/EmptyPendingApprovals";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { exportToExcelWithSections } from "@/utils/excelUtils";

interface ApprovedOrdersListProps {
  approvedOrders: any[];
}

export const ApprovedOrdersList = ({ approvedOrders }: ApprovedOrdersListProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExpandToggle = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };
  
  const handleExportToExcel = (orderId: string) => {
    const orderToExport = approvedOrders.find(order => order.separacaoId === orderId);
    
    if (!orderToExport || !orderToExport.clienteData) {
      toast({
        title: "Erro ao exportar",
        description: "Dados insuficientes para exportação",
        variant: "destructive",
      });
      return;
    }
    
    const approvedSeparacao = orderToExport.clienteData.separacoes && 
      orderToExport.clienteData.separacoes.length > 0 ? 
      orderToExport.clienteData.separacoes.find(
        sep => sep && sep.id === orderToExport.separacaoId
      ) : null;
    
    if (!approvedSeparacao) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível encontrar os dados da separação",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare header data
    const headerData = [
      {
        Cliente: orderToExport.clienteData.APELIDO || 'Cliente sem nome',
        'Data de Aprovação': new Date(orderToExport.approvedAt).toLocaleString('pt-BR'),
        'Aprovado por': orderToExport.userEmail || 'Não informado',
        Status: 'Aprovado',
        'Valor Total': approvedSeparacao.valor_total || 0,
        'Quantidade de Itens': approvedSeparacao.quantidade_itens || 0
      }
    ];
    
    // Prepare items data (the rows will be added automatically with 2 empty rows in between)
    let itemsData = [];
    
    if (approvedSeparacao.separacao_itens_flat && approvedSeparacao.separacao_itens_flat.length > 0) {
      // Add items
      itemsData = approvedSeparacao.separacao_itens_flat.map(item => ({
        'Pedido': item.pedido || '-',
        'SKU': item.item_codigo || '-',
        'Descrição': item.descricao || '-',
        'Quantidade': item.quantidade_pedida || 0,
        'Valor Unitário': item.valor_unitario || 0,
        'Valor Total': item.valor_total || (item.quantidade_pedida * item.valor_unitario) || 0
      }));
    }
    
    // Export to Excel with sections
    const clientName = orderToExport.clienteData.APELIDO || 'cliente';
    const fileName = `pedido-aprovado-${clientName}-${format(new Date(), 'dd-MM-yyyy')}`;
    
    const exportedCount = exportToExcelWithSections(headerData, itemsData, fileName);
    
    if (exportedCount > 0) {
      toast({
        title: "Exportação concluída",
        description: `${exportedCount} registros exportados com sucesso`,
        variant: "default",
      });
    } else {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    }
  };

  if (approvedOrders.length === 0) {
    return <EmptyPendingApprovals />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {approvedOrders.map((order) => {
        if (!order || !order.clienteData) return null;
        
        const approvedSeparacao = order.clienteData.separacoes && 
          order.clienteData.separacoes.length > 0 ? 
          order.clienteData.separacoes.find(
            sep => sep && sep.id === order.separacaoId
          ) : null;
        
        if (!approvedSeparacao) return null;
        
        console.log("Rendering card for separacao:", approvedSeparacao);
        
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1 text-xs"
                    onClick={() => handleExportToExcel(order.separacaoId)}
                  >
                    <Download className="h-3.5 w-3.5" />
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
  );
};

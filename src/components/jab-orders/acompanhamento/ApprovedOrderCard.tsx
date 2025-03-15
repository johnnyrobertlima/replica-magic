
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PedidosIncluidos } from "./PedidosIncluidos";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface ApprovedOrderCardProps {
  order: any;
  onExport: (orderId: string) => void;
}

export const ApprovedOrderCard = ({ order, onExport }: ApprovedOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemsWithEntrega, setItemsWithEntrega] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  if (!order || !order.clienteData) return null;
  
  const approvedSeparacao = order.clienteData.separacoes && 
    order.clienteData.separacoes.length > 0 ? 
    order.clienteData.separacoes.find(
      sep => sep && sep.id === order.separacaoId
    ) : null;
  
  if (!approvedSeparacao) return null;

  useEffect(() => {
    const fetchEntregaData = async () => {
      if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
        setIsLoadingItems(false);
        return;
      }
      
      try {
        // Prepare items for filtering from BLUEBAY_PEDIDO
        const itemsToFetch = approvedSeparacao.separacao_itens_flat
          .filter(item => item && item.pedido && item.item_codigo)
          .map(item => ({
            pedido: item.pedido,
            item_codigo: item.item_codigo
          }));
        
        if (itemsToFetch.length === 0) {
          setItemsWithEntrega(approvedSeparacao.separacao_itens_flat);
          setIsLoadingItems(false);
          return;
        }
        
        // Fetch the data from BLUEBAY_PEDIDO based on order numbers and item codes
        const { data: pedidoData, error } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, ITEM_CODIGO, QTDE_ENTREGUE')
          .in('PED_NUMPEDIDO', itemsToFetch.map(item => item.pedido))
          .in('ITEM_CODIGO', itemsToFetch.map(item => item.item_codigo));
        
        if (error) {
          console.error('Error fetching QTDE_ENTREGUE from BLUEBAY_PEDIDO:', error);
          setItemsWithEntrega(approvedSeparacao.separacao_itens_flat);
          setIsLoadingItems(false);
          return;
        }
        
        // Create a map of PED_NUMPEDIDO+ITEM_CODIGO to QTDE_ENTREGUE for easy lookup
        const entregaMap = {};
        pedidoData.forEach(row => {
          const key = `${row.PED_NUMPEDIDO}:${row.ITEM_CODIGO}`;
          entregaMap[key] = row.QTDE_ENTREGUE;
        });
        
        // Update the items with the correct QTDE_ENTREGUE values
        const updatedItems = approvedSeparacao.separacao_itens_flat.map(item => {
          if (item && item.pedido && item.item_codigo) {
            const key = `${item.pedido}:${item.item_codigo}`;
            const quantidadeEntregue = entregaMap[key] !== undefined ? entregaMap[key] : 0;
            return {
              ...item,
              quantidade_entregue: quantidadeEntregue
            };
          }
          return item;
        });
        
        setItemsWithEntrega(updatedItems);
      } catch (error) {
        console.error('Error in fetchEntregaData:', error);
        setItemsWithEntrega(approvedSeparacao.separacao_itens_flat);
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    fetchEntregaData();
  }, [approvedSeparacao.separacao_itens_flat]);

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate values using the updated items with entrega data
  const valorTotal = isLoadingItems ? 0 : 
    itemsWithEntrega.reduce((total, item) => {
      return total + ((item.quantidade_pedida || 0) * (item.valor_unitario || 0));
    }, 0);

  // Calculate the delivered value using the updated items with entrega data
  const valorFaturado = isLoadingItems ? 0 : 
    itemsWithEntrega.reduce((total, item) => {
      return total + ((item.quantidade_entregue || 0) * (item.valor_unitario || 0));
    }, 0);

  // Calculate the value that remains to be invoiced
  const valorFaltaFaturar = valorTotal - valorFaturado;

  // Calculate the percentage that has been invoiced
  const percentualFaturado = valorTotal > 0 ? Math.round((valorFaturado / valorTotal) * 100) : 0;

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
            <p className="text-xs text-gray-600 mt-1 font-medium">
              Representante: {order.clienteData.representanteNome || 'Não informado'}
            </p>
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
            <Button 
              variant="ghost"
              size="sm"
              className="h-8 px-3 flex items-center gap-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
              onClick={handleExpandToggle}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Expandir
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Valor Total</p>
            <p className="font-medium">{formatCurrency(valorTotal)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Falta Faturar</p>
            <p className="font-medium">{formatCurrency(valorFaltaFaturar)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Valor Entregue</p>
            <p className="font-medium">{formatCurrency(valorFaturado)}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-500">Progresso de Faturamento</p>
            <p className="text-xs font-medium">{percentualFaturado}%</p>
          </div>
          <Progress 
            value={percentualFaturado} 
            className="h-2 bg-gray-200" 
          />
        </div>
        
        {isExpanded && (
          <PedidosIncluidos 
            approvedSeparacao={approvedSeparacao} 
            itemsWithEntrega={itemsWithEntrega}
            isLoading={isLoadingItems}
          />
        )}
      </CardContent>
    </Card>
  );
};

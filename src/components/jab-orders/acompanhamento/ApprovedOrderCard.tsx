
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
  const [processedItems, setProcessedItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  if (!order || !order.cliente_data) return null;
  
  const approvedSeparacao = order.cliente_data.separacoes && 
    order.cliente_data.separacoes.length > 0 ? 
    order.cliente_data.separacoes.find(
      sep => sep && sep.id === order.separacao_id
    ) : null;
  
  if (!approvedSeparacao) return null;

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchEntregaData = async () => {
      if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
        setProcessedItems([]);
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
          setProcessedItems(approvedSeparacao.separacao_itens_flat);
          setIsLoadingItems(false);
          return;
        }
        
        console.log('ApprovedOrderCard: Fetching delivery data for items:', itemsToFetch);
        
        // Fetch the data from BLUEBAY_PEDIDO based on order numbers and item codes
        const { data: pedidoData, error } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, ITEM_CODIGO, QTDE_ENTREGUE')
          .in('PED_NUMPEDIDO', itemsToFetch.map(item => item.pedido))
          .in('ITEM_CODIGO', itemsToFetch.map(item => item.item_codigo));
        
        if (error) {
          console.error('Error fetching QTDE_ENTREGUE from BLUEBAY_PEDIDO:', error);
          setProcessedItems(approvedSeparacao.separacao_itens_flat);
          setIsLoadingItems(false);
          return;
        }
        
        console.log('ApprovedOrderCard: Received pedido data:', pedidoData);
        
        // Create a map of PED_NUMPEDIDO+ITEM_CODIGO to QTDE_ENTREGUE for easy lookup
        const entregaMap = {};
        pedidoData.forEach(row => {
          const key = `${row.PED_NUMPEDIDO}:${row.ITEM_CODIGO}`;
          entregaMap[key] = row.QTDE_ENTREGUE || 0;
        });
        
        // Update the items with the correct QTDE_ENTREGUE values
        const updatedItems = approvedSeparacao.separacao_itens_flat.map(item => {
          if (item && item.pedido && item.item_codigo) {
            const key = `${item.pedido}:${item.item_codigo}`;
            // Ensure we always have a number for quantidade_entregue, defaulting to 0
            const quantidadeEntregue = entregaMap[key] !== undefined ? Number(entregaMap[key]) : 0;
            return {
              ...item,
              quantidade_entregue: quantidadeEntregue
            };
          }
          return {
            ...item,
            quantidade_entregue: 0 // Ensure default value is 0, not null or undefined
          };
        });
        
        console.log('ApprovedOrderCard: Updated items with entrega data:', updatedItems);
        setProcessedItems(updatedItems);
      } catch (error) {
        console.error('Error in fetchEntregaData:', error);
        // Even on error, ensure we set default value for quantidade_entregue
        const defaultItems = approvedSeparacao.separacao_itens_flat.map(item => ({
          ...item,
          quantidade_entregue: item.quantidade_entregue || 0
        }));
        setProcessedItems(defaultItems);
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    fetchEntregaData();
  }, [approvedSeparacao.separacao_itens_flat]);

  // Calculate values using the processed items with updated quantidade_entregue
  const calculateValues = () => {
    const items = isLoadingItems ? approvedSeparacao.separacao_itens_flat || [] : processedItems;
    
    // Calcular o valor total dos itens (Quantidade Pedida * Valor Unit.)
    const valorTotal = items.reduce((total, item) => {
      return total + ((item.quantidade_pedida || 0) * (item.valor_unitario || 0));
    }, 0);

    // Calcular o valor já entregue (Quantidade Entregue * Valor Unit.)
    const valorFaturado = items.reduce((total, item) => {
      return total + ((item.quantidade_entregue || 0) * (item.valor_unitario || 0));
    }, 0);

    // Calcular o valor que falta faturar (Total - Faturado)
    const valorFaltaFaturar = valorTotal - valorFaturado;

    // Calcular o percentual faturado
    const percentualFaturado = valorTotal > 0 ? Math.round((valorFaturado / valorTotal) * 100) : 0;
    
    return { valorTotal, valorFaturado, valorFaltaFaturar, percentualFaturado };
  };
  
  const { valorTotal, valorFaturado, valorFaltaFaturar, percentualFaturado } = calculateValues();

  return (
    <Card 
      className={`border-l-4 border-l-green-500 shadow-md ${isExpanded ? 'col-span-full' : ''}`}
    >
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {order.cliente_data.APELIDO || 'Cliente sem nome'}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Aprovado em: {new Date(order.approved_at).toLocaleString('pt-BR')}
            </p>
            {order.user_email && (
              <p className="text-xs text-gray-500">
                Por: {order.user_email} ({order.action === 'approved' ? 'Aprovado' : 'Reprovado'})
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1 font-medium">
              Representante: {order.cliente_data.representanteNome || 'Não informado'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 flex items-center gap-1 text-xs"
              onClick={() => onExport(order.separacao_id)}
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
            <p className="text-xs text-gray-500">Faturado</p>
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
          <PedidosIncluidos approvedSeparacao={{ 
            ...approvedSeparacao,
            separacao_itens_flat: processedItems.length > 0 ? processedItems : approvedSeparacao.separacao_itens_flat
          }} />
        )}
      </CardContent>
    </Card>
  );
};

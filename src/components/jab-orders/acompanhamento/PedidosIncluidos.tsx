
import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PedidosIncluidosProps {
  approvedSeparacao: any;
}

export const PedidosIncluidos = ({ approvedSeparacao }: PedidosIncluidosProps) => {
  const [itemsWithEntrega, setItemsWithEntrega] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEntregaData = async () => {
      if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
        setIsLoading(false);
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
          setIsLoading(false);
          return;
        }
        
        console.log('PedidosIncluidos: Fetching delivery data for items:', itemsToFetch);
        
        // Create a map of all the order number + item code combinations
        const pedidoItemPairs = itemsToFetch.map(item => `${item.pedido}:${item.item_codigo}`);
        
        // Fetch the data from BLUEBAY_PEDIDO based on order numbers and item codes
        const { data: pedidoData, error } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, ITEM_CODIGO, QTDE_ENTREGUE')
          .in('PED_NUMPEDIDO', itemsToFetch.map(item => item.pedido))
          .in('ITEM_CODIGO', itemsToFetch.map(item => item.item_codigo));
        
        if (error) {
          console.error('Error fetching QTDE_ENTREGUE from BLUEBAY_PEDIDO:', error);
          setItemsWithEntrega(approvedSeparacao.separacao_itens_flat);
          setIsLoading(false);
          return;
        }
        
        console.log('PedidosIncluidos: Received pedido data:', pedidoData);
        
        // Create a map of PED_NUMPEDIDO+ITEM_CODIGO to QTDE_ENTREGUE for easy lookup
        const entregaMap = {};
        pedidoData.forEach(row => {
          const key = `${row.PED_NUMPEDIDO}:${row.ITEM_CODIGO}`;
          entregaMap[key] = row.QTDE_ENTREGUE || 0;
        });
        
        console.log('PedidosIncluidos: Created entrega map:', entregaMap);
        
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
        
        console.log('PedidosIncluidos: Updated items with entrega data:', updatedItems);
        setItemsWithEntrega(updatedItems);
      } catch (error) {
        console.error('Error in fetchEntregaData:', error);
        // Even on error, ensure we set default value for quantidade_entregue
        const defaultItems = approvedSeparacao.separacao_itens_flat.map(item => ({
          ...item,
          quantidade_entregue: item.quantidade_entregue || 0
        }));
        setItemsWithEntrega(defaultItems);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntregaData();
  }, [approvedSeparacao.separacao_itens_flat]);
  
  if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
    return null;
  }
  
  if (isLoading) {
    return <div className="mt-4 pt-4 border-t border-gray-200">Carregando dados de entrega...</div>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
        <FileText className="h-4 w-4" /> 
        Pedidos incluídos:
      </h4>
      
      <div className="overflow-x-auto">
        <Table className="text-xs w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Solicitado</TableHead>
              <TableHead className="text-right">Entregue</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Valor Faturado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemsWithEntrega
              .filter(item => item && item.pedido)
              .map((item, index) => {
                // Use quantidade_pedida directly from the item
                const quantidade = item.quantidade_pedida || 0;
                const quantidadeEntregue = item.quantidade_entregue || 0;
                const valorUnitario = item.valor_unitario || 0;
                const saldo = item.quantidade_saldo || (quantidade - quantidadeEntregue);
                
                const valorTotal = quantidade * valorUnitario;
                const valorFaturado = quantidadeEntregue * valorUnitario;
                
                return (
                  <TableRow key={`item-${item.pedido}-${item.item_codigo}-${index}`}>
                    <TableCell>{item.pedido}</TableCell>
                    <TableCell>{item.item_codigo}</TableCell>
                    <TableCell>{item.descricao || 'Sem descrição'}</TableCell>
                    <TableCell className="text-right">{quantidade}</TableCell>
                    <TableCell className="text-right">{quantidadeEntregue}</TableCell>
                    <TableCell className="text-right">{saldo}</TableCell>
                    <TableCell className="text-right">{formatCurrency(valorUnitario)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(valorTotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(valorFaturado)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

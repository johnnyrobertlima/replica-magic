
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

interface PedidosIncluidosProps {
  approvedSeparacao: any;
}

export const PedidosIncluidos = ({ approvedSeparacao }: PedidosIncluidosProps) => {
  if (!approvedSeparacao.separacao_itens_flat || approvedSeparacao.separacao_itens_flat.length === 0) {
    return null;
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
              <TableHead className="text-right">Faturado</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvedSeparacao.separacao_itens_flat
              .filter(item => item && item.pedido)
              .map((item, index) => {
                const valorTotal = (item.quantidade_pedida || 0) * (item.valor_unitario || 0);
                return (
                  <TableRow key={`item-${item.pedido}-${item.item_codigo}-${index}`}>
                    <TableCell>{item.pedido}</TableCell>
                    <TableCell>{item.item_codigo}</TableCell>
                    <TableCell>{item.descricao || 'Sem descrição'}</TableCell>
                    <TableCell className="text-right">{item.quantidade_pedida || 0}</TableCell>
                    <TableCell className="text-right">{item.quantidade_entregue || 0}</TableCell>
                    <TableCell className="text-right">{item.quantidade_saldo || (item.quantidade_pedida - (item.quantidade_entregue || 0))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.valor_unitario || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(valorTotal)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

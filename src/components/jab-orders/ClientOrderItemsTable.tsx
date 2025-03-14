
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";

interface OrderItem {
  pedido: string;
  ITEM_CODIGO: string;
  DESCRICAO?: string | null;
  QTDE_PEDIDA: number;
  QTDE_ENTREGUE: number;
  QTDE_SALDO: number;
  FISICO?: number | null;
  VALOR_UNITARIO: number;
  emSeparacao?: boolean;
  PES_CODIGO?: string | number | null;
  APELIDO?: string | null;
}

interface ClientOrderItemsTableProps {
  items: OrderItem[];
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const ClientOrderItemsTable = ({
  items,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: ClientOrderItemsTableProps) => {
  const filteredItems = items.filter((item) => {
    if (!showZeroBalance && item.QTDE_SALDO <= 0) return false;
    if (showOnlyWithStock && (item.FISICO || 0) <= 0) return false;
    return true;
  });

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-2"></th>
            <th className="text-left p-2">Pedido</th>
            <th className="text-left p-2">SKU</th>
            <th className="text-left p-2">Descrição</th>
            <th className="text-right p-2">Solicitado</th>
            <th className="text-right p-2">Entregue</th>
            <th className="text-right p-2">Saldo</th>
            <th className="text-right p-2">Qt. Físico</th>
            <th className="text-right p-2">Valor Unit.</th>
            <th className="text-right p-2">Valor Pedido</th>
            <th className="text-right p-2">Valor Saldo</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => {
            const valorPedido = item.QTDE_PEDIDA * item.VALOR_UNITARIO;
            const valorSaldo = item.QTDE_SALDO * item.VALOR_UNITARIO;
            
            return (
              <tr 
                key={`${item.pedido}-${item.ITEM_CODIGO}-${index}`} 
                className={cn(
                  "border-t",
                  item.emSeparacao && "bg-[#FEF7CD]" // Fundo amarelo claro para itens em separação
                )}
              >
                <td className="p-2">
                  <Checkbox
                    checked={selectedItems.includes(item.ITEM_CODIGO)}
                    onCheckedChange={() => onItemSelect(item)}
                    disabled={item.emSeparacao}
                  />
                </td>
                <td className="p-2">{item.pedido}</td>
                <td className="p-2">{item.ITEM_CODIGO}</td>
                <td className="p-2">
                  {item.DESCRICAO || '-'}
                  {item.emSeparacao && (
                    <span className="ml-2 text-amber-600 text-xs font-medium">
                      (Em separação)
                    </span>
                  )}
                </td>
                <td className="p-2 text-right">{item.QTDE_PEDIDA}</td>
                <td className="p-2 text-right">{item.QTDE_ENTREGUE}</td>
                <td className="p-2 text-right">{item.QTDE_SALDO}</td>
                <td className="p-2 text-right">{item.FISICO || '-'}</td>
                <td className="p-2 text-right">
                  {formatCurrency(item.VALOR_UNITARIO)}
                </td>
                <td className="p-2 text-right">
                  {formatCurrency(valorPedido)}
                </td>
                <td className="p-2 text-right">
                  {formatCurrency(valorSaldo)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

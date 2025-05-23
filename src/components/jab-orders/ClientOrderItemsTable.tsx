
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
  // Filtra primeiro e depois ordena por ITEM_CODIGO (SKU)
  const filteredItems = items
    .filter((item) => {
      if (!showZeroBalance && item.QTDE_SALDO <= 0) return false;
      if (showOnlyWithStock && (item.FISICO || 0) <= 0) return false;
      return true;
    })
    .sort((a, b) => a.ITEM_CODIGO.localeCompare(b.ITEM_CODIGO)); // Ordena por SKU alfabeticamente

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
            // Use a combination of item code, pedido, and index to ensure uniqueness
            const itemKey = `${item.ITEM_CODIGO}-${item.pedido}-${index}`;
            const isSelected = selectedItems.includes(item.ITEM_CODIGO);
            
            return (
              <tr 
                key={itemKey}
                className={cn(
                  "border-t",
                  item.emSeparacao && "bg-[#FEF7CD]", // Fundo amarelo claro para itens em separação
                  isSelected && !item.emSeparacao && "bg-blue-50" // Destaque visual para itens selecionados
                )}
              >
                <td className="p-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onItemSelect(item)} // Pass the complete item object
                    disabled={item.emSeparacao}
                    id={itemKey}
                    aria-label={`Selecionar item ${item.ITEM_CODIGO}`}
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

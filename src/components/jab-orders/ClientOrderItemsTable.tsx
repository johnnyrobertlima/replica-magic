
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePendingValues } from "@/hooks/approved-orders/usePendingValues";

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
  const [updatedItems, setUpdatedItems] = useState<OrderItem[]>(items);
  const { fetchCurrentItemDetails } = usePendingValues();

  // When items change or on initial load, refresh the actual saldo values
  useEffect(() => {
    const refreshItemData = async () => {
      const updatedItemsData = [...items];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        try {
          // Fetch the current data for each item
          const currentData = await fetchCurrentItemDetails(
            item.pedido,
            item.ITEM_CODIGO
          );
          
          if (currentData) {
            // Update with fresh data from the database
            updatedItemsData[i] = {
              ...item,
              QTDE_SALDO: Number(currentData.QTDE_SALDO || 0),
              QTDE_PEDIDA: Number(currentData.QTDE_PEDIDA || 0),
              QTDE_ENTREGUE: Number(currentData.QTDE_ENTREGUE || 0),
              VALOR_UNITARIO: Number(currentData.VALOR_UNITARIO || 0)
            };
          }
        } catch (err) {
          console.error(`Error refreshing data for item ${item.ITEM_CODIGO}:`, err);
        }
      }
      
      setUpdatedItems(updatedItemsData);
    };
    
    refreshItemData();
  }, [items, fetchCurrentItemDetails]);

  const filteredItems = updatedItems.filter((item) => {
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
            <th className="text-right p-2">Falta Faturar</th>
            <th className="text-right p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => {
            const faltaFaturarValue = item.QTDE_SALDO * item.VALOR_UNITARIO;
            
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
                    disabled={item.emSeparacao || item.QTDE_SALDO <= 0}
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
                  {formatCurrency(faltaFaturarValue)}
                </td>
                <td className="p-2 text-right">
                  {formatCurrency(faltaFaturarValue)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import type { OrderItem } from "./types";
import { useEffect, useState } from "react";
import { usePendingValues } from "@/hooks/approved-orders/usePendingValues";

interface OrderItemsTableProps {
  items: OrderItem[];
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (itemCode: string) => void;
}

export const OrderItemsTable = ({ 
  items, 
  showZeroBalance, 
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: OrderItemsTableProps) => {
  const [updatedItems, setUpdatedItems] = useState<OrderItem[]>(items);
  const { fetchCurrentItemDetails } = usePendingValues();

  // When items change or on initial load, refresh the actual saldo values
  useEffect(() => {
    const refreshItemData = async () => {
      const updatedItemsData = [...items];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        try {
          // Check if item has a valid pedido property that is a string
          if (item && typeof item.PED_NUMPEDIDO === 'string') {
            // Fetch the current data for each item
            const currentData = await fetchCurrentItemDetails(
              item.PED_NUMPEDIDO,
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
          }
        } catch (err) {
          console.error(`Error refreshing data for item ${item.ITEM_CODIGO}:`, err);
        }
      }
      
      setUpdatedItems(updatedItemsData);
    };
    
    refreshItemData();
  }, [items, fetchCurrentItemDetails]);

  const filteredItems = updatedItems.filter(item => {
    if (!showZeroBalance && item.QTDE_SALDO <= 0) return false;
    if (showOnlyWithStock && (item.FISICO || 0) <= 0) return false;
    return true;
  });

  return (
    <div className="bg-muted p-4 rounded-lg">
      <h4 className="font-semibold mb-4">Itens do Pedido</h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">QT Pedido</TableHead>
              <TableHead className="text-right">QT Faturada</TableHead>
              <TableHead className="text-right">QT Saldo</TableHead>
              <TableHead className="text-right">QT Físico</TableHead>
              <TableHead className="text-right">VL Uni</TableHead>
              <TableHead className="text-right">VL Total Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item, index) => (
              <TableRow key={`${item.ITEM_CODIGO}-${index}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.ITEM_CODIGO)}
                    onCheckedChange={() => onItemSelect(item.ITEM_CODIGO)}
                    disabled={item.QTDE_SALDO <= 0}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                <TableCell>{item.DESCRICAO || '-'}</TableCell>
                <TableCell className="text-right">{item.QTDE_PEDIDA.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.QTDE_ENTREGUE.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.QTDE_SALDO.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.FISICO?.toLocaleString() || '-'}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.VALOR_UNITARIO)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.QTDE_SALDO * item.VALOR_UNITARIO)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

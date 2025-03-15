
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { OrderItem } from "./types";

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
  const filteredItems = items.filter(item => {
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
              <TableHead className="text-right">QT Entregue</TableHead>
              <TableHead className="text-right">QT Saldo</TableHead>
              <TableHead className="text-right">QT Físico</TableHead>
              <TableHead className="text-right">VL Uni</TableHead>
              <TableHead className="text-right">VL Total Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <TableRow key={`${item.ITEM_CODIGO}-${index}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.ITEM_CODIGO)}
                      onCheckedChange={() => onItemSelect(item.ITEM_CODIGO)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                  <TableCell>{item.DESCRICAO || '-'}</TableCell>
                  <TableCell className="text-right">{item.QTDE_PEDIDA.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.QTDE_ENTREGUE.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.QTDE_SALDO.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.FISICO?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-right">
                    {item.VALOR_UNITARIO.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {(item.QTDE_SALDO * item.VALOR_UNITARIO).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

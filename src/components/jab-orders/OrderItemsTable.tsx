
import { useState, useEffect } from "react";
import type { JabOrderItem } from "@/types/jabOrders";
import { Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchRejectedSeparationItems } from "@/services/separation/separationDbService";

interface OrderItemsTableProps {
  items: JabOrderItem[];
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (item: any) => void;
}

export const OrderItemsTable = ({
  items,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: OrderItemsTableProps) => {
  const [rejectedItems, setRejectedItems] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const loadRejectedItems = async () => {
      const items = await fetchRejectedSeparationItems();
      const rejectedItemsMap: Record<string, boolean> = {};
      
      items.forEach(item => {
        rejectedItemsMap[item.item_codigo] = true;
      });
      
      setRejectedItems(rejectedItemsMap);
    };
    
    loadRejectedItems();
  }, []);

  const filteredItems = items.filter(item => {
    if (!showZeroBalance && item.QTDE_SALDO === 0) return false;
    if (showOnlyWithStock && (!item.FISICO || item.FISICO <= 0)) return false;
    return true;
  });

  if (filteredItems.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Nenhum item encontrado com os filtros atuais.</p>;
  }

  return (
    <div className="border rounded-md max-h-[500px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Qtde. Pedida</TableHead>
            <TableHead className="text-right">Qtde. Entregue</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="text-right">Qtde. Físico</TableHead>
            <TableHead className="text-right">Valor Unit.</TableHead>
            <TableHead className="text-right">Valor Saldo</TableHead>
            <TableHead className="text-right w-[80px]">Em Separação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => {
            const isRejected = rejectedItems[item.ITEM_CODIGO];
            const valorSaldo = item.QTDE_SALDO * item.VALOR_UNITARIO;
            const isSelected = selectedItems.includes(item.ITEM_CODIGO);
            
            return (
              <TableRow 
                key={item.ITEM_CODIGO}
                className={isRejected ? "bg-red-50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onItemSelect(item)}
                  />
                </TableCell>
                <TableCell 
                  className={isRejected ? "text-red-600 font-medium" : ""}
                >
                  {item.ITEM_CODIGO}
                  {isRejected && (
                    <span className="ml-2 text-xs px-1 py-0.5 bg-red-100 text-red-800 rounded">
                      Reprovado
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.DESCRICAO}</TableCell>
                <TableCell className="text-right">{item.QTDE_PEDIDA}</TableCell>
                <TableCell className="text-right">{item.QTDE_ENTREGUE}</TableCell>
                <TableCell className="text-right">{item.QTDE_SALDO}</TableCell>
                <TableCell className="text-right">{item.FISICO || "-"}</TableCell>
                <TableCell className="text-right">
                  {item.VALOR_UNITARIO.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {valorSaldo.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {item.emSeparacao ? <Check className="h-4 w-4 text-green-500 ml-auto" /> : 
                    isRejected ? <X className="h-4 w-4 text-red-500 ml-auto" /> : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};


import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { JabOrder, JabOrderItem } from "@/types/jabOrders";

interface OrderCardProps {
  order: JabOrder;
  isExpanded: boolean;
  showZeroBalance: boolean;
  onToggleExpand: () => void;
  onToggleZeroBalance: () => void;
}

const OrderCard = ({ order, isExpanded, showZeroBalance, onToggleExpand, onToggleZeroBalance }: OrderCardProps) => {
  const filteredItems = showZeroBalance
    ? order.items
    : order.items.filter((item: JabOrderItem) => item.QTDE_SALDO > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="text-sm font-medium">
            Pedido: {order.PED_NUMPEDIDO}
          </div>
          <div className="text-xs text-muted-foreground">
            {`${order.PES_CODIGO}`}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleExpand}>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Total Saldo:</div>
          <div className="text-right">{order.total_saldo}</div>
          <div>Valor Total:</div>
          <div className="text-right">{formatCurrency(order.valor_total)}</div>
        </div>

        {isExpanded && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Items</div>
              <Button variant="outline" size="sm" onClick={onToggleZeroBalance}>
                {showZeroBalance ? "Ocultar" : "Mostrar"} Saldo Zero
              </Button>
            </div>
            <div className="space-y-2">
              {filteredItems.map((item: JabOrderItem) => (
                <div key={item.ITEM_CODIGO} className="text-xs space-y-1 p-2 border rounded">
                  <div className="font-medium">{item.DESCRICAO || item.ITEM_CODIGO}</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>Saldo:</div>
                    <div className="text-right">{item.QTDE_SALDO}</div>
                    <div>Pedido:</div>
                    <div className="text-right">{item.QTDE_PEDIDA}</div>
                    <div>Entregue:</div>
                    <div className="text-right">{item.QTDE_ENTREGUE}</div>
                    <div>Valor Unit:</div>
                    <div className="text-right">{formatCurrency(item.VALOR_UNITARIO)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;

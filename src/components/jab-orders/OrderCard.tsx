
import { useState } from "react";
import type { JabOrder } from "@/types/jabOrders";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderProgress } from "./OrderProgress";
import { Button } from "@/components/ui/button";

interface OrderCardProps {
  order: JabOrder;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (itemCode: string) => void;
}

export const OrderCard = ({ 
  order, 
  showZeroBalance, 
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
      <div className="p-6">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Pedido: {order.PED_NUMPEDIDO}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpand}
              >
                {isExpanded ? 'Recolher' : 'Expandir'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {order.PEDIDO_CLIENTE && (
              <p>Pedido Cliente: {order.PEDIDO_CLIENTE}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground">
            <p>Status: {order.STATUS}</p>
            <p>Total de Saldo: {order.total_saldo}</p>
            <p>Valor Total: {order.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}</p>
          </div>

          {isExpanded && (
            <OrderItemsTable 
              items={order.items} 
              showZeroBalance={showZeroBalance}
              showOnlyWithStock={showOnlyWithStock}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

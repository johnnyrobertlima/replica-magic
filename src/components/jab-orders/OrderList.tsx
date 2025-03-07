
import { OrderCard } from "@/components/jab-orders/OrderCard";
import type { JabOrder } from "@/types/jabOrders";

interface OrderListProps {
  orders: JabOrder[];
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  onItemSelect: (itemCode: string) => void;
}

export const OrderList = ({
  orders,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  onItemSelect
}: OrderListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard
          key={`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`}
          order={order}
          showZeroBalance={showZeroBalance}
          showOnlyWithStock={showOnlyWithStock}
          selectedItems={selectedItems}
          onItemSelect={onItemSelect}
        />
      ))}
    </div>
  );
};

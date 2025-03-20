
import { useState } from "react";
import { OrderStatus } from "@/components/jab-orders/OrdersHeader";

export const useBkOrderStatuses = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);

  const handleStatusChange = (status: OrderStatus) => {
    if (status === 'all') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([status]);
    }
  };

  return {
    selectedStatuses,
    setSelectedStatuses,
    handleStatusChange,
  };
};

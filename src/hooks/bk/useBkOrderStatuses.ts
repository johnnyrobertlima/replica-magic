
import { useState } from "react";
import { OrderStatus } from "@/components/jab-orders/OrdersHeader";

export const useBkOrderStatuses = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);

  const handleStatusChange = (status: OrderStatus) => {
    // If "all" is selected, clear all selections
    if (status === 'all') {
      setSelectedStatuses([]);
      return;
    }
    
    // Check if status is already selected
    if (selectedStatuses.includes(status)) {
      // If already selected, remove it
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      // If not selected, add it
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  return {
    selectedStatuses,
    setSelectedStatuses,
    handleStatusChange,
  };
};

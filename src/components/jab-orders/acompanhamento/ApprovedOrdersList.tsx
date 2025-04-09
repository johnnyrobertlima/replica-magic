
import { ApprovedOrderCard } from "./ApprovedOrderCard";
import { EmptyApprovedOrdersList } from "./EmptyApprovedOrdersList";
import { useExportToExcel } from "./useExportToExcel";

interface ApprovedOrdersListProps {
  approvedOrders: any[];
}

export const ApprovedOrdersList = ({ approvedOrders }: ApprovedOrdersListProps) => {
  const { handleExportToExcel } = useExportToExcel();

  if (approvedOrders.length === 0) {
    return <EmptyApprovedOrdersList />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {approvedOrders.map((order) => (
        <ApprovedOrderCard 
          key={order.separacao_id || order.id}
          order={order}
          onExport={(orderId) => handleExportToExcel(order.separacao_id || order.id, approvedOrders)}
        />
      ))}
    </div>
  );
};

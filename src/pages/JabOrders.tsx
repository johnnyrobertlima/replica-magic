
import { useJabOrders } from "@/hooks/useJabOrders";
import { OrderCard } from "@/components/jab-orders/OrderCard";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import { SearchFilters } from "@/components/jab-orders/SearchFilters";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const JabOrders = () => {
  const {
    orders,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    status,
    setStatus,
    totals
  } = useJabOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/client-area">
          <Button variant="outline">Voltar para Área do Cliente</Button>
        </Link>
      </div>
      
      <OrdersHeader />
      
      <div className="mb-6">
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          status={status}
          setStatus={setStatus}
        />
      </div>

      <div className="mb-6">
        <TotalCards totals={totals} />
      </div>

      <div className="grid gap-4">
        {orders?.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <div className="mt-6">
        <OrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default JabOrders;

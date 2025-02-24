
import { useState } from "react";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import OrderCard from "@/components/jab-orders/OrderCard";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import SearchFilters from "@/components/jab-orders/SearchFilters";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

const JabOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [searchType, setSearchType] = useState<SearchType>("pedido");

  const { data, isLoading } = useJabOrders({
    dateRange,
    page: currentPage,
    pageSize: 10
  });

  const { data: totalsData } = useTotals();

  const handleSearch = () => {
    // Implementar lógica de busca
    console.log("Searching...", { searchQuery, dateRange, searchType });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const orders = data?.orders || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/client-area">
          <Button variant="outline">Voltar para Área do Cliente</Button>
        </Link>
      </div>
      
      <OrdersHeader 
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        date={dateRange}
        onDateChange={setDateRange}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
      />
      
      <div className="mb-6">
        <SearchFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          date={dateRange}
          onDateChange={setDateRange}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />
      </div>

      {totalsData && (
        <div className="mb-6">
          <TotalCards
            valorTotalSaldo={totalsData.valorTotalSaldo}
            valorFaturarComEstoque={totalsData.valorFaturarComEstoque}
          />
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order) => (
          <OrderCard 
            key={`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}`} 
            order={order}
            isExpanded={false}
            showZeroBalance={false}
            onToggleExpand={() => {}}
            onToggleZeroBalance={() => {}}
          />
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

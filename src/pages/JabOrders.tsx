
import { Loader2 } from "lucide-react";
import { OrderFilters } from "@/components/jab-orders/OrderFilters";
import { OrderList } from "@/components/jab-orders/OrderList";
import { OrderSelectionSummary } from "@/components/jab-orders/OrderSelectionSummary";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader, OrderStatus } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import { useOrdersState } from "@/hooks/useOrdersState";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";
import { useState } from "react";

const JabOrders = () => {
  const {
    date,
    setDate,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    showZeroBalance,
    setShowZeroBalance,
    showOnlyWithStock,
    setShowOnlyWithStock,
    selectedItems,
    ordersData,
    totals,
    filteredOrders,
    selectedItemsTotals,
    isLoading,
    totalPages,
    handleItemSelect,
    handleSearch
  } = useOrdersState();

  // Add state for status filtering
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);

  const handleStatusChange = (status: OrderStatus) => {
    if (status === 'all') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([status]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <TotalCards
            valorTotalSaldoPeriodo={totals.valorTotalSaldoPeriodo || 0}
            valorFaturarComEstoquePeriodo={totals.valorFaturarComEstoquePeriodo || 0}
            valoresLiberadosParaFaturamento={totals.valoresLiberadosParaFaturamento || 0}
            valorTotalSaldo={selectedItems.length > 0 ? selectedItemsTotals.totalValor : totals.valorTotalSaldo}
            valorFaturarComEstoque={selectedItems.length > 0 ? selectedItemsTotals.totalComEstoque : totals.valorFaturarComEstoque}
          />

          <OrdersHeader
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={ordersData.totalCount}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            date={date}
            onDateChange={setDate}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
            selectedStatuses={selectedStatuses}
            onStatusChange={handleStatusChange}
          />

          <OrderFilters
            showZeroBalance={showZeroBalance}
            setShowZeroBalance={setShowZeroBalance}
            showOnlyWithStock={showOnlyWithStock}
            setShowOnlyWithStock={setShowOnlyWithStock}
          />

          <OrderList
            orders={filteredOrders}
            showZeroBalance={showZeroBalance}
            showOnlyWithStock={showOnlyWithStock}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
          />

          <OrderSelectionSummary
            selectedItems={selectedItems}
            totalSaldo={selectedItemsTotals.totalSaldo}
            totalValor={selectedItemsTotals.totalValor}
          />

          <OrdersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
};

export default JabOrders;

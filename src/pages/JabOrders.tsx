
import { Loader2 } from "lucide-react";
import { OrderFilters } from "@/components/jab-orders/OrderFilters";
import { OrderList } from "@/components/jab-orders/OrderList";
import { OrderSelectionSummary } from "@/components/jab-orders/OrderSelectionSummary";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import { useOrdersState } from "@/hooks/useOrdersState";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-6">
        <JabNavMenu />
      </div>

      <div className="space-y-6">
        <TotalCards
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
    </main>
  );
};

export default JabOrders;

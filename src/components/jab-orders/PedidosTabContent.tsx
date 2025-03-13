
import { TotalCards } from "./TotalCards";
import { OrdersHeader } from "./OrdersHeader";
import { ClientOrderCard } from "./ClientOrderCard";
import { SelectionSummary } from "./SelectionSummary";
import { OrdersPagination } from "./OrdersPagination";

interface PedidosTabContentProps {
  totals: {
    valorTotalSaldo: number;
    valorFaturarComEstoque: number;
  };
  date: any;
  setDate: (date: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: any;
  setSearchType: (type: any) => void;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  expandedClients: Set<string>;
  filteredGroups: Record<string, any>;
  paginatedGroups: Record<string, any>;
  totalSelecionado: number;
  isSending: boolean;
  currentPage: number;
  totalPages: number;
  totalClients: number;
  setCurrentPage: (page: number) => void;
  toggleExpand: (clientName: string) => void;
  handleSearch: () => void;
  handleItemSelect: (item: any) => void;
  handleEnviarParaSeparacao: () => void;
  exportSelectedItemsToExcel: () => void;
}

export const PedidosTabContent = ({
  totals,
  date,
  setDate,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  showZeroBalance,
  showOnlyWithStock,
  selectedItems,
  expandedClients,
  filteredGroups,
  paginatedGroups,
  totalSelecionado,
  isSending,
  currentPage,
  totalPages,
  totalClients,
  setCurrentPage,
  toggleExpand,
  handleSearch,
  handleItemSelect,
  handleEnviarParaSeparacao,
  exportSelectedItemsToExcel
}: PedidosTabContentProps) => {
  // Log client count for verification
  console.log(`PedidosTabContent rendering with ${Object.keys(paginatedGroups).length} paginados de ${totalClients} clientes totais`);
  
  return (
    <>
      <TotalCards
        valorTotalSaldo={totals.valorTotalSaldo}
        valorFaturarComEstoque={totals.valorFaturarComEstoque}
      />

      <OrdersHeader
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalClients}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        date={date}
        onDateChange={setDate}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(paginatedGroups).map(([clientName, data]) => (
          <ClientOrderCard
            key={clientName}
            clientName={clientName}
            data={data}
            isExpanded={expandedClients.has(clientName)}
            onToggleExpand={() => toggleExpand(clientName)}
            showZeroBalance={showZeroBalance}
            showOnlyWithStock={showOnlyWithStock}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <OrdersPagination
          currentPage={currentPage} 
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <SelectionSummary
        selectedItems={selectedItems}
        totalSelecionado={totalSelecionado}
        isSending={isSending}
        onSendToSeparacao={handleEnviarParaSeparacao}
        onExportToExcel={exportSelectedItemsToExcel}
      />
    </>
  );
};

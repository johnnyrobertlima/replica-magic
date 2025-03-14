
import { TotalCards } from "./TotalCards";
import { OrdersHeader } from "./OrdersHeader";
import { ClientOrderCard } from "./ClientOrderCard";
import { SelectionSummary } from "./SelectionSummary";

interface PedidosTabContentProps {
  totals: {
    valorTotalSaldo: number;
    valorFaturarComEstoque: number;
    valorTotalSaldoPeriodo: number;
    valorFaturarComEstoquePeriodo: number;
    valoresLiberadosParaFaturamento: number;
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
  totalSelecionado: number;
  isSending: boolean;
  toggleExpand: (clientName: string) => void;
  handleSearch: () => void;
  handleItemSelect: (item: any) => void;
  handleEnviarParaSeparacao: () => void;
  exportSelectedItemsToExcel: () => void;
  clearSelections: () => void;
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
  totalSelecionado,
  isSending,
  toggleExpand,
  handleSearch,
  handleItemSelect,
  handleEnviarParaSeparacao,
  exportSelectedItemsToExcel,
  clearSelections
}: PedidosTabContentProps) => {
  return (
    <>
      <TotalCards
        valorTotalSaldo={totals.valorTotalSaldo}
        valorFaturarComEstoque={totals.valorFaturarComEstoque}
        valorTotalSaldoPeriodo={totals.valorTotalSaldoPeriodo}
        valorFaturarComEstoquePeriodo={totals.valorFaturarComEstoquePeriodo}
        valoresLiberadosParaFaturamento={totals.valoresLiberadosParaFaturamento}
      />

      <OrdersHeader
        currentPage={1}
        totalPages={1}
        totalCount={Object.keys(filteredGroups).length}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        date={date}
        onDateChange={setDate}
        searchType={searchType}
        onSearchTypeChange={setSearchType}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(filteredGroups).map(([clientName, data]) => (
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

      <SelectionSummary
        selectedItems={selectedItems}
        totalSelecionado={totalSelecionado}
        isSending={isSending}
        onSendToSeparacao={handleEnviarParaSeparacao}
        onExportToExcel={exportSelectedItemsToExcel}
        onClearSelections={clearSelections}
      />
    </>
  );
};

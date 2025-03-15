
import { TotalCards } from "./TotalCards";
import { OrdersHeader } from "./OrdersHeader";
import { RepresentanteOrderCard } from "./RepresentanteOrderCard";
import { SelectionSummary } from "./SelectionSummary";

interface RepresentantePedidosTabContentProps {
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

export const RepresentantePedidosTabContent = ({
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
}: RepresentantePedidosTabContentProps) => {
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

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(filteredGroups).map(([representanteName, data]) => (
          <RepresentanteOrderCard
            key={representanteName}
            representanteName={representanteName}
            data={data}
            isExpanded={expandedClients.has(representanteName)}
            onToggleExpand={() => toggleExpand(representanteName)}
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

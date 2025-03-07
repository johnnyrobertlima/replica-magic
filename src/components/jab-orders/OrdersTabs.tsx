
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ClientOrderCard } from "./ClientOrderCard";
import { SeparacaoCard } from "./SeparacaoCard";
import { SelectionSummary } from "./SelectionSummary";
import { TotalCards } from "./TotalCards";
import { OrdersHeader } from "./OrdersHeader";

interface OrdersTabsProps {
  clientOrders: ReturnType<typeof import("@/hooks/useClientOrders").useClientOrders>;
}

export const OrdersTabs = ({ clientOrders }: OrdersTabsProps) => {
  const {
    date,
    setDate,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    showZeroBalance,
    setShowZeroBalance,
    showOnlyWithStock,
    setShowOnlyWithStock,
    selectedItems,
    expandedClients,
    isSending,
    totals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
    exportSelectedItemsToExcel, // Add the new function
  } = clientOrders;

  return (
    <Tabs defaultValue="pedidos">
      <TabsList>
        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        <TabsTrigger value="separacoes">Separações ({separacoes.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pedidos">
        <TotalCards
          valorTotalSaldo={totals.valorTotalSaldo}
          valorFaturarComEstoque={totals.valorFaturarComEstoque}
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
        />
      </TabsContent>

      <TabsContent value="separacoes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {separacoes.length > 0 ? (
            separacoes.map((separacao) => (
              <SeparacaoCard key={separacao.id} separacao={separacao} />
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Nenhuma separação encontrada.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

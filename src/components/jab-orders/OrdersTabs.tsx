
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PedidosTabContent } from "./PedidosTabContent";
import { SeparacoesTabContent } from "./SeparacoesTabContent";

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
    exportSelectedItemsToExcel,
    clearSelections,
  } = clientOrders;

  return (
    <Tabs defaultValue="pedidos">
      <TabsList>
        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        <TabsTrigger value="separacoes">Separações ({separacoes.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pedidos">
        <PedidosTabContent
          totals={totals}
          date={date}
          setDate={setDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          showZeroBalance={showZeroBalance}
          showOnlyWithStock={showOnlyWithStock}
          selectedItems={selectedItems}
          expandedClients={expandedClients}
          filteredGroups={filteredGroups}
          totalSelecionado={totalSelecionado}
          isSending={isSending}
          toggleExpand={toggleExpand}
          handleSearch={handleSearch}
          handleItemSelect={handleItemSelect}
          handleEnviarParaSeparacao={handleEnviarParaSeparacao}
          exportSelectedItemsToExcel={exportSelectedItemsToExcel}
          clearSelections={clearSelections}
          selectedStatuses={[]}
          onStatusChange={() => {}}
        />
      </TabsContent>

      <TabsContent value="separacoes">
        <SeparacoesTabContent separacoes={separacoes} />
      </TabsContent>
    </Tabs>
  );
};

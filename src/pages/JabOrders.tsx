import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders, useTotals } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import { OrderCard } from "@/components/jab-orders/OrderCard";
import { TotalCards } from "@/components/jab-orders/TotalCards";
import { OrdersHeader } from "@/components/jab-orders/OrdersHeader";
import { OrdersPagination } from "@/components/jab-orders/OrdersPagination";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { Switch } from "@/components/ui/switch";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";

const ITEMS_PER_PAGE = 15;

const JabOrders = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("pedido");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);
  const [showZeroBalance, setShowZeroBalance] = useState(true);

  const { data: ordersData = { orders: [], totalCount: 0 }, isLoading: isLoadingOrders } = useJabOrders({
    dateRange: searchDate,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const handleItemSelect = (itemCode: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemCode)) {
        return prev.filter(code => code !== itemCode);
      }
      return [...prev, itemCode];
    });
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  };

  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  };

  const filteredOrders = ordersData.orders.filter((order) => {
    if (!["1", "2"].includes(order.STATUS)) {
      return false;
    }

    if (!isSearching) return true;
    
    if (searchQuery) {
      const normalizedSearchQuery = searchQuery.toLowerCase().trim();
      
      switch (searchType) {
        case "pedido":
          const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
          const normalizedSearchNumber = removeLeadingZeros(searchQuery);
          return normalizedOrderNumber.includes(normalizedSearchNumber);
        
        case "cliente":
          return order.APELIDO?.toLowerCase().includes(normalizedSearchQuery) || false;
        
        case "representante":
          return order.REPRESENTANTE_NOME?.toLowerCase().includes(normalizedSearchQuery) || false;
        
        default:
          return false;
      }
    }
    
    return true;
  });

  const selectedItemsTotals = filteredOrders.reduce((acc, order) => {
    const selectedOrderItems = order.items.filter(item => selectedItems.includes(item.ITEM_CODIGO));
    
    selectedOrderItems.forEach(item => {
      acc.totalSaldo += item.QTDE_SALDO;
      acc.totalValor += item.QTDE_SALDO * item.VALOR_UNITARIO;
      if ((item.FISICO || 0) > 0) {
        acc.totalComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
      }
    });
    
    return acc;
  }, { totalSaldo: 0, totalValor: 0, totalComEstoque: 0 });

  const totalPages = Math.ceil(ordersData.totalCount / ITEMS_PER_PAGE);

  if (isLoadingOrders || isLoadingTotals) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <Link to="/client-area" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Área do Cliente
        </Link>
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

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={showZeroBalance}
              onCheckedChange={setShowZeroBalance}
              id="show-zero-balance"
            />
            <label 
              htmlFor="show-zero-balance"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Mostrar itens com saldo zero
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={showOnlyWithStock}
              onCheckedChange={setShowOnlyWithStock}
              id="show-only-with-stock"
            />
            <label 
              htmlFor="show-only-with-stock"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Mostrar apenas itens com estoque físico
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`}
              order={order}
              showZeroBalance={showZeroBalance}
              showOnlyWithStock={showOnlyWithStock}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
            />
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-card text-card-foreground p-4 rounded-lg shadow-lg border">
            <p className="text-sm font-medium">Itens Selecionados: {selectedItems.length}</p>
            <p className="text-sm">Total Saldo: {selectedItemsTotals.totalSaldo}</p>
            <p className="text-sm">Valor Total: {selectedItemsTotals.totalValor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}</p>
          </div>
        )}

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

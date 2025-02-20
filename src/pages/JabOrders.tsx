
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders, type JabOrder } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import OrderCard from "@/components/jab-orders/OrderCard";
import SearchFilters from "@/components/jab-orders/SearchFilters";

const JabOrders = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showZeroBalanceMap, setShowZeroBalanceMap] = useState<Record<string, boolean>>({});
  const { data: orders = [], isLoading } = useJabOrders(searchDate);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const toggleShowZeroBalance = (orderId: string) => {
    setShowZeroBalanceMap(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
  };

  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  };

  const filteredOrders = orders.filter((order: JabOrder) => {
    // Primeiro filtra por status
    if (!["1", "2"].includes(order.STATUS)) {
      return false;
    }

    // Depois aplica o filtro de pesquisa se necessário
    if (!isSearching) return true;
    
    if (searchQuery) {
      const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
      const normalizedSearchQuery = removeLeadingZeros(searchQuery);
      return normalizedOrderNumber.includes(normalizedSearchQuery);
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Separação de Pedidos JAB</h1>
        <SearchFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          date={date}
          onDateChange={setDate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order: JabOrder) => {
          const orderId = `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
          const isExpanded = expandedOrder === orderId;
          const showZeroBalance = showZeroBalanceMap[orderId] || false;

          return (
            <OrderCard
              key={orderId}
              order={order}
              isExpanded={isExpanded}
              showZeroBalance={showZeroBalance}
              onToggleExpand={() => toggleExpand(orderId)}
              onToggleZeroBalance={() => toggleShowZeroBalance(orderId)}
            />
          );
        })}
      </div>
    </main>
  );
};

export default JabOrders;

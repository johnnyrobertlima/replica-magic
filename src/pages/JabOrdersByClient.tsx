
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import SearchFilters from "@/components/jab-orders/SearchFilters";
import ClientOrderCard from "@/components/jab-orders-by-client/ClientOrderCard";
import type { ClientOrder } from "@/components/jab-orders-by-client/types";

const JabOrdersByClient = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: orders = [], isLoading } = useJabOrders(searchDate);

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
  };

  // Agrupar pedidos por cliente
  const clientOrders = orders.reduce<Record<string, ClientOrder>>((acc, order) => {
    if (!order.APELIDO) return acc;

    if (!acc[order.APELIDO]) {
      acc[order.APELIDO] = {
        APELIDO: order.APELIDO,
        total_saldo: 0,
        valor_total: 0,
        pedidos: [],
        items: []
      };
    }

    const clientOrder = acc[order.APELIDO];
    clientOrder.pedidos.push(order);
    clientOrder.total_saldo += order.total_saldo;
    clientOrder.valor_total += order.valor_total;

    // Consolidar itens
    order.items.forEach(item => {
      clientOrder.items.push({ 
        ...item,
        PED_NUMPEDIDO: order.PED_NUMPEDIDO 
      });
    });

    return acc;
  }, {});

  const filteredClients = Object.values(clientOrders).filter(client => {
    if (searchQuery) {
      return client.APELIDO.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h1 className="text-3xl font-bold">Separação de Pedidos por Cliente</h1>
        <SearchFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          date={date}
          onDateChange={setDate}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClients.map((client) => (
          <ClientOrderCard
            key={client.APELIDO}
            client={client}
            isExpanded={expandedClient === client.APELIDO}
            onToggleExpand={() => setExpandedClient(expandedClient === client.APELIDO ? null : client.APELIDO)}
          />
        ))}
      </div>
    </main>
  );
};

export default JabOrdersByClient;

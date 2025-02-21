
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import SearchFilters from "@/components/jab-orders/SearchFilters";
import ClientOrderCard from "@/components/jab-orders-by-client/ClientOrderCard";
import type { ClientOrder } from "@/components/jab-orders-by-client/types";

const ITEMS_PER_PAGE = 12; // 3x4 grid

const JabOrdersByClient = () => {
  // Definir um intervalo padrão de 30 dias
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  const [date, setDate] = useState<DateRange | undefined>({
    from: trintaDiasAtras,
    to: hoje,
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: orders = [], isLoading } = useJabOrders(searchDate);

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  };

  console.log("Total de pedidos recebidos:", orders.length); // Debug log

  // Agrupar pedidos por cliente usando PES_CODIGO
  const clientOrders = orders.reduce<Record<string, ClientOrder>>((acc, order) => {
    // Garantir que temos um identificador válido para o cliente
    const pesCodigoKey = order.PES_CODIGO ? order.PES_CODIGO.toString() : 'NAO_IDENTIFICADO';

    if (!acc[pesCodigoKey]) {
      acc[pesCodigoKey] = {
        PES_CODIGO: order.PES_CODIGO || 0,
        total_saldo: 0,
        valor_total: 0,
        pedidos: [],
        items: []
      };
    }

    const clientOrder = acc[pesCodigoKey];
    
    // Acumular valores
    const saldo = order.QTDE_SALDO || 0;
    const valorUnitario = order.VALOR_UNITARIO || 0;
    
    clientOrder.pedidos.push(order);
    clientOrder.total_saldo += saldo;
    clientOrder.valor_total += (saldo * valorUnitario);

    // Adicionar item apenas se houver ITEM_CODIGO
    if (order.ITEM_CODIGO) {
      clientOrder.items.push({
        ITEM_CODIGO: order.ITEM_CODIGO,
        DESCRICAO: order.DESCRICAO || null,
        QTDE_SALDO: saldo,
        QTDE_PEDIDA: order.QTDE_PEDIDA || 0,
        QTDE_ENTREGUE: order.QTDE_ENTREGUE || 0,
        VALOR_UNITARIO: valorUnitario,
        PED_NUMPEDIDO: order.PED_NUMPEDIDO
      });
    }

    return acc;
  }, {});

  console.log("Total de clientes agrupados:", Object.keys(clientOrders).length); // Debug log

  const filteredClients = Object.values(clientOrders).filter(client => {
    if (searchQuery) {
      // Busca por PES_CODIGO ou por itens do pedido
      return (
        client.PES_CODIGO.toString().includes(searchQuery) ||
        client.items.some(item => 
          item.ITEM_CODIGO.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }
    return true;
  });

  console.log("Total de clientes filtrados:", filteredClients.length); // Debug log

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Separação de Pedidos por Cliente</h1>
          <p className="text-sm text-muted-foreground">
            Total de clientes: {filteredClients.length}
            {filteredClients.length > ITEMS_PER_PAGE && 
              ` (Mostrando ${((currentPage - 1) * ITEMS_PER_PAGE) + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)})`
            }
          </p>
        </div>
        <SearchFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          date={date}
          onDateChange={setDate}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedClients.map((client) => (
          <ClientOrderCard
            key={client.PES_CODIGO}
            client={client}
            isExpanded={expandedClient === client.PES_CODIGO.toString()}
            onToggleExpand={() => setExpandedClient(expandedClient === client.PES_CODIGO.toString() ? null : client.PES_CODIGO.toString())}
          />
        ))}
      </div>

      {filteredClients.length > ITEMS_PER_PAGE && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </main>
  );
};

export default JabOrdersByClient;

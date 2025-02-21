
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import SearchFilters from "@/components/jab-orders/SearchFilters";
import ClientOrdersGrid from "@/components/jab-orders-by-client/ClientOrdersGrid";
import ClientOrdersPagination from "@/components/jab-orders-by-client/ClientOrdersPagination";
import { useClientOrders } from "@/hooks/useClientOrders";

const ITEMS_PER_PAGE = 30;

const JabOrdersByClient = () => {
  const {
    date,
    setDate,
    searchQuery,
    setSearchQuery,
    handleSearch,
    filteredClients,
    isLoading,
    currentPage,
    setCurrentPage
  } = useClientOrders();

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

      <ClientOrdersGrid clients={paginatedClients} />

      {filteredClients.length > ITEMS_PER_PAGE && (
        <ClientOrdersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  );
};

export default JabOrdersByClient;

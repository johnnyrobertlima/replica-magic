
import { Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const JabOrdersByClient = () => {
  const clientOrders = useClientOrders();
  const { 
    isLoading, 
    ordersData, 
    filteredGroups, 
    totalClients
  } = clientOrders;

  // Log key metrics for debugging
  useEffect(() => {
    console.log("DIAGNOSTIC LOG: JabOrdersByClient rendering with:", {
      isLoading,
      totalCount: ordersData.totalCount,
      clientCount: Object.keys(filteredGroups).length,
      allClientsCount: Object.keys(clientOrders.filteredGroups).length,
      totalClients: totalClients
    });

    // Check if we're missing clients
    if (ordersData.totalCount > 0 && totalClients < ordersData.totalCount) {
      console.warn(`DIAGNOSTIC WARNING: Expected ${ordersData.totalCount} clientes/pedidos mas mostrando apenas ${totalClients} clientes`);
      
      // Show toast with diagnostic information
      toast({
        title: "Atenção",
        description: `Mostrando ${totalClients} de ${ordersData.totalCount} clientes/pedidos esperados. Use a paginação para ver todos.`,
        variant: "destructive",
      });
    }
  }, [isLoading, ordersData.totalCount, filteredGroups, clientOrders.filteredGroups, totalClients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-end md:items-center gap-4 mb-6">
        <JabNavMenu />
      </div>

      <div className="space-y-6">
        <OrdersTabs clientOrders={clientOrders} />
      </div>
      <Toaster />
    </main>
  );
};

export default JabOrdersByClient;

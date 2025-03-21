
import React, { useEffect } from "react";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";
import { Button } from "@/components/ui/button";
import { useExportClientOrders } from "@/hooks/useExportClientOrders";
import { useToast } from "@/hooks/use-toast";

const JabOrdersByClient = () => {
  const clientOrders = useClientOrders();
  const { isLoading, date, filteredGroups, handleSearch } = clientOrders;
  const { toast } = useToast();
  const { exportOrdersToExcel } = useExportClientOrders();

  // Force search on initial load if date is available but no data is loaded
  useEffect(() => {
    if (date && Object.keys(filteredGroups).length === 0 && !isLoading) {
      handleSearch();
    }
  }, [date, filteredGroups, isLoading, handleSearch]);

  const handleExport = () => {
    if (Object.keys(clientOrders.filteredGroups).length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há pedidos para exportar no momento.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const exported = exportOrdersToExcel(clientOrders.filteredGroups);
      
      if (exported) {
        toast({
          title: "Exportação concluída",
          description: "Os dados foram exportados com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pedidos por Cliente</h1>
          <Button 
            onClick={handleExport} 
            className="bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar para Excel
          </Button>
        </div>
        <div className="space-y-6">
          <OrdersTabs clientOrders={clientOrders} />
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default JabOrdersByClient;

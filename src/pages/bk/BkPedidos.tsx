
import { Loader2, AlertOctagon, User } from "lucide-react";
import { useClientOrders } from "@/hooks/useBkClientOrders";
import { OrdersTabs } from "@/components/bk/pedidos/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import { BkMenu } from "@/components/bk/BkMenu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BkPedidos = () => {
  const clientOrders = useClientOrders();
  const { isLoading, isRepresentanteBK, representanteNome, error } = clientOrders;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container-fluid p-0 max-w-full">
      <BkMenu />
      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertOctagon className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isRepresentanteBK && representanteNome && (
          <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
            <User className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Modo Representante</AlertTitle>
            <AlertDescription className="text-blue-700">
              Você está visualizando apenas os pedidos do representante: <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{representanteNome}</Badge>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <OrdersTabs clientOrders={clientOrders} />
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default BkPedidos;

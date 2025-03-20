
import { Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useBkClientOrders";
import { OrdersTabs } from "@/components/bk/pedidos/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import { BkMenu } from "@/components/bk/BkMenu";
import { Badge } from "@/components/ui/badge";

const BkPedidos = () => {
  const clientOrders = useClientOrders();
  const { isLoading, isRepresentanteBK, representanteNome } = clientOrders;

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
        {isRepresentanteBK && representanteNome && (
          <div className="mb-4">
            <Badge variant="secondary" className="px-3 py-1.5 text-base">
              Representante: {representanteNome}
            </Badge>
          </div>
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


import { Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useBkClientOrders";
import { OrdersTabs } from "@/components/bk/pedidos/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import { BkMenu } from "@/components/bk/BkMenu";

const BkPedidos = () => {
  const clientOrders = useClientOrders();
  const { isLoading } = clientOrders;

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
        <div className="space-y-6">
          <OrdersTabs clientOrders={clientOrders} />
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default BkPedidos;


import { Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";

const JabOrdersByClient = () => {
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
      <BluebayMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <OrdersTabs clientOrders={clientOrders} />
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default JabOrdersByClient;

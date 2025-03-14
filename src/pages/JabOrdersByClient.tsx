
import { Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { useEffect } from "react";

const JabOrdersByClient = () => {
  const clientOrders = useClientOrders();
  const { isLoading, selectedItems } = clientOrders;

  // Add debug useEffect
  useEffect(() => {
    console.log("JabOrdersByClient - selectedItems:", selectedItems);
  }, [selectedItems]);

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

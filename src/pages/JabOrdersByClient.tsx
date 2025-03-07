
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";

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
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="space-y-6">
        <OrdersTabs clientOrders={clientOrders} />
      </div>
      <Toaster />
    </main>
  );
};

export default JabOrdersByClient;


import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <Link to="/client-area" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Área do Cliente
        </Link>
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

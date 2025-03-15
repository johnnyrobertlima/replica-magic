
import { Loader2 } from "lucide-react";
import { useRepresentanteOrders } from "@/hooks/useRepresentanteOrders";
import { OrdersTabs } from "@/components/jab-orders/OrdersTabs";
import { Toaster } from "@/components/ui/toaster";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { RepresentanteOrdersTabs } from "@/components/jab-orders/RepresentanteOrdersTabs";

const JabOrdersByRepresentante = () => {
  const representanteOrders = useRepresentanteOrders();
  const { isLoading } = representanteOrders;

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

      <h1 className="text-2xl font-bold mb-6">Separação por Representante</h1>

      <div className="space-y-6">
        <RepresentanteOrdersTabs clientOrders={representanteOrders} />
      </div>
      <Toaster />
    </main>
  );
};

export default JabOrdersByRepresentante;

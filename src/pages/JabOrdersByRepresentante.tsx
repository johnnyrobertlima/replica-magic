
import { Loader2 } from "lucide-react";
import { useRepresentanteOrders } from "@/hooks/useRepresentanteOrders";
import { Toaster } from "@/components/ui/toaster";
import { RepresentanteOrdersTabs } from "@/components/jab-orders/RepresentanteOrdersTabs";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";

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
    <main className="container-fluid p-0 max-w-full">
      <BluebayMenu />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Separação por Representante</h1>

        <div className="space-y-6">
          <RepresentanteOrdersTabs clientOrders={representanteOrders} />
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default JabOrdersByRepresentante;

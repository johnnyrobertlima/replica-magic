
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Boxes, ClipboardCheck, FileCheck } from "lucide-react";

const BluebayHome = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Área do Cliente Bluebay</h1>
          <p className="text-muted-foreground">
            Acesse as funcionalidades disponíveis para sua conta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/client-area/bluebay/jab-orders-by-client">
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Boxes className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Pedidos por Cliente</CardTitle>
                    <CardDescription>
                      Visualize e gerencie pedidos agrupados por cliente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/client-area/bluebay/jab-orders">
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Separação de Pedidos</CardTitle>
                    <CardDescription>
                      Acompanhe e gerencie as separações de pedidos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/client-area/bluebay/aprovacao-financeira">
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Aprovação Financeira</CardTitle>
                    <CardDescription>
                      Aprove ou reprove pedidos pendentes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default BluebayHome;

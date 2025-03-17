
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { BarChart2, Boxes, ClipboardCheck, FileCheck, LogOut, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { JabHeroBanner } from "@/components/jab-orders/JabHeroBanner";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";
import { Toaster } from "@/components/ui/toaster";

const BluebayHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você será redirecionado para a página de login",
      });
      
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <JabHeroBanner />
      <BluebayMenu />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold">Área do Cliente Bluebay</h1>
            <p className="text-muted-foreground">
              Acesse as funcionalidades disponíveis para sua conta
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl mb-4">Área JAB</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/client-area/jab/jab-orders-by-client">
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

              <Link to="/client-area/jab/jab-orders">
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

              <Link to="/client-area/jab/jab-orders-by-representante">
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Boxes className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Separação por Representante</CardTitle>
                        <CardDescription>
                          Visualize e gerencie pedidos agrupados por representante
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/client-area/jab/aprovacao-financeira">
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

              <Link to="/client-area/jab/acompanhamento-faturamento">
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BarChart2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Acompanhamento de Faturamento</CardTitle>
                        <CardDescription>
                          Acompanhe os dados de faturamento e vendas
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </div>
      <Toaster />
    </main>
  );
};

export default BluebayHome;

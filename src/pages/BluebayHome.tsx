
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Boxes, ClipboardCheck, FileCheck, LogOut, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import JabNavMenu from "@/components/jab-orders/JabNavMenu";
import { useQuery } from "@tanstack/react-query";
import { getStorageUrl } from "@/utils/imageUtils";
import { Loader2 } from "lucide-react";

const BluebayHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: banner, isLoading: isBannerLoading } = useQuery({
    queryKey: ["bluebay-banner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .eq("page", "bluebay-home")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

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
    <main className="container mx-auto px-4 py-6">
      {isBannerLoading ? (
        <div className="flex items-center justify-center h-48 mb-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : banner ? (
        <div className="relative rounded-lg overflow-hidden mb-8">
          <div 
            className="h-64 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('${getStorageUrl(banner.image_url)}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center">
              <div className="text-white p-8 max-w-xl">
                <h1 className="text-3xl font-bold mb-4">{banner.title}</h1>
                <p className="text-lg mb-6">{banner.description}</p>
                {banner.button_text && (
                  <a 
                    href={banner.button_link} 
                    className="bg-white text-primary px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                  >
                    {banner.button_text}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary to-primary/60 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">Bem-vindo à Área do Cliente Bluebay</h1>
          <p className="text-xl">Acesse as funcionalidades disponíveis para gerenciar seus pedidos e acompanhar suas separações.</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold">Área do Cliente JAB</h2>
            <p className="text-muted-foreground">
              Gerencie seus pedidos e acompanhe o status das separações
            </p>
          </div>
          <div className="flex items-center gap-4">
            <JabNavMenu />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl mb-4">Funcionalidades</CardTitle>
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

              <Link to="/client-area/bluebay/acompanhamento-faturamento">
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Acompanhamento de Faturamento</CardTitle>
                        <CardDescription>
                          Monitore e exporte informações de faturamento
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
    </main>
  );
};

export default BluebayHome;

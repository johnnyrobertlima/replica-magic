
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getMainMenuItems, getAdminMenuItems } from "./menu/menuItems";
import { DesktopMenu } from "./menu/DesktopMenu";
import { MobileMenu } from "./menu/MobileMenu";

export const OniAgenciaMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Get menu items
  const mainMenuItems = getMainMenuItems();
  const adminMenuItems = getAdminMenuItems();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado",
      });
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Não foi possível desconectar. Tente novamente.",
      });
    }
  };

  // Função para verificar se a rota atual é ou está dentro de um caminho pai
  const isActiveRoute = (path: string) => {
    if (path === "/client-area/oniagencia" && location.pathname === "/client-area/oniagencia") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/client-area/oniagencia";
  };

  // Check if any admin route is active
  const isAnyAdminRouteActive = () => {
    return adminMenuItems.some(item => isActiveRoute(item.path));
  };

  // We need to compute this value here instead of passing the function
  const anyAdminRouteActive = isAnyAdminRouteActive();

  return (
    <div className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <DesktopMenu 
          mainMenuItems={mainMenuItems}
          adminMenuItems={adminMenuItems}
          isActiveRoute={isActiveRoute}
          isAnyAdminRouteActive={anyAdminRouteActive}
          onLogout={handleLogout}
        />

        <MobileMenu 
          mainMenuItems={mainMenuItems}
          adminMenuItems={adminMenuItems}
          isActiveRoute={isActiveRoute}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};


import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Users, Receipt, BarChart2, FileText, ClipboardCheck, LogOut, FileSpreadsheet, Package, ShoppingBag } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const BkMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { name: "Home BK", path: "/client-area/bk", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { name: "Clientes", path: "/client-area/bk/clients", icon: <Users className="h-4 w-4 mr-2" /> },
    { name: "Faturamento", path: "/client-area/bk/financial", icon: <Receipt className="h-4 w-4 mr-2" /> },
    { name: "Financeiro", path: "/client-area/bk/financeiromanager", icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> },
    { name: "Estoque", path: "/client-area/bk/estoque", icon: <Package className="h-4 w-4 mr-2" /> },
    { name: "Pedidos", path: "/client-area/bk/pedidos", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { name: "Relatório de Itens", path: "/client-area/bk/reports", icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: "Solicitações", path: "/client-area/bk/requests", icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
  ];

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

  return (
    <div className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-between items-center py-3">
          <div className="flex items-center space-x-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap",
                    isActive ? "bg-primary-800" : ""
                  )
                }
                end={item.path === "/client-area/bk"}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-between items-center py-3">
          <span className="font-semibold text-lg text-white">B&K Menu</span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mr-2 text-white bg-blue-700 hover:bg-blue-800"
            >
              <LogOut size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-white hover:bg-primary-700"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden py-2 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-2 text-sm rounded-md transition-colors text-white",
                    isActive ? "bg-primary-800" : "hover:bg-primary-700"
                  )
                }
                onClick={() => setIsOpen(false)}
                end={item.path === "/client-area/bk"}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm rounded-md transition-colors text-white bg-blue-700 hover:bg-blue-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

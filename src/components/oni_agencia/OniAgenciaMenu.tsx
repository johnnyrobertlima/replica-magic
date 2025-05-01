
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Users, 
  FileSpreadsheet, 
  BarChart2, 
  CheckSquare, 
  LogOut, 
  UserPlus, 
  CalendarDays,
  BookText,
  Briefcase,
  Smartphone,
  ChevronDown,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const OniAgenciaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [mobileAdminExpanded, setMobileAdminExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Main menu items (non-admin)
  const mainMenuItems = [
    { name: "Home Oni Agência", path: "/client-area/oniagencia", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { name: "Visualização em Campo", path: "/client-area/oniagencia/controle-pauta/visualizacaoemcampo", icon: <Smartphone className="h-4 w-4 mr-2" /> },
    { name: "Controle de Pauta", path: "/client-area/oniagencia/controle-pauta", icon: <CalendarDays className="h-4 w-4 mr-2" /> },
    { name: "Relatórios", path: "/client-area/oniagencia/relatorios", icon: <CheckSquare className="h-4 w-4 mr-2" /> },
  ];

  // Admin submenu items
  const adminMenuItems = [
    { name: "Clientes", path: "/client-area/oniagencia/clientes", icon: <Users className="h-4 w-4 mr-2" /> },
    { name: "Serviços", path: "/client-area/oniagencia/servicos", icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> },
    { name: "Colaboradores", path: "/client-area/oniagencia/colaboradores", icon: <UserPlus className="h-4 w-4 mr-2" /> },
    { name: "Escopo por Cliente", path: "/client-area/oniagencia/escopos", icon: <Briefcase className="h-4 w-4 mr-2" /> },
    { name: "Gerenciar Conteúdo", path: "/admin/sub-themes", icon: <BookText className="h-4 w-4 mr-2" /> },
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

  const toggleMobileAdminMenu = () => {
    setMobileAdminExpanded(!mobileAdminExpanded);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-between items-center py-3">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {mainMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap",
                    (isActive || isActiveRoute(item.path)) ? "bg-primary-800 font-medium" : ""
                  )
                }
                end={item.path === "/client-area/oniagencia"}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            
            {/* Admin Dropdown Menu */}
            <DropdownMenu open={adminMenuOpen} onOpenChange={setAdminMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap",
                    isAnyAdminRouteActive() ? "bg-primary-800 font-medium" : ""
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-primary-800 text-white border-primary-700">
                {adminMenuItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild className="focus:bg-primary-700 focus:text-white hover:bg-primary-700">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex w-full items-center px-2 py-1.5 text-white",
                          (isActive || isActiveRoute(item.path)) ? "bg-primary-900 font-medium" : ""
                        )
                      }
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-colors ml-2 shrink-0"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-between items-center py-3">
          <span className="font-semibold text-lg text-white">Oni Agência</span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mr-2 text-white bg-blue-700 hover:bg-blue-800"
              aria-label="Sair"
            >
              <LogOut size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white border-blue-600 bg-blue-600 hover:bg-blue-700"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden py-2 space-y-1 max-h-[calc(100vh-70px)] overflow-y-auto bg-primary-900 rounded-b-lg">
            {/* Main menu items */}
            {mainMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors text-white",
                    (isActive || isActiveRoute(item.path)) ? "bg-primary-900 font-medium" : "hover:bg-primary-700"
                  )
                }
                onClick={() => setIsOpen(false)}
                end={item.path === "/client-area/oniagencia"}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
            
            {/* Admin section header with toggle */}
            <button 
              onClick={toggleMobileAdminMenu}
              className="w-full px-4 pt-2 pb-1 text-sm font-semibold text-gray-300 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileAdminExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Admin menu items, conditionally displayed */}
            {mobileAdminExpanded && (
              <div className="space-y-1">
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-6 py-3 text-sm rounded-md transition-colors text-white",
                        (isActive || isActiveRoute(item.path)) ? "bg-primary-900 font-medium" : "hover:bg-primary-700"
                      )
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm rounded-md transition-colors text-white bg-blue-700 hover:bg-blue-800"
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

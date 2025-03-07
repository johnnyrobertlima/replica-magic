
import { ChevronDown } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const JabNavMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const menuItems = [
    {
      label: "JAB - Início",
      path: "/client-area/bluebay",
    },
    {
      label: "Pedidos por Cliente",
      path: "/client-area/bluebay/jab-orders-by-client",
    },
    {
      label: "Separação de Pedidos",
      path: "/client-area/bluebay/jab-orders",
    },
    {
      label: "Aprovação Financeira",
      path: "/client-area/bluebay/aprovacao-financeira",
    },
    {
      label: "Acompanhamento Faturamento",
      path: "/client-area/bluebay/acompanhamento-faturamento",
    },
  ];

  // Find the current page label
  const currentPage = menuItems.find((item) => item.path === currentPath);
  
  return (
    <div className="mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            JAB - {currentPage?.label || "Menu"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background">
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.path} className="cursor-pointer">
              <Link 
                to={item.path} 
                className={`w-full ${currentPath === item.path ? "font-bold" : ""}`}
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default JabNavMenu;

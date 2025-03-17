
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const BluebayMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Início", path: "/client-area/bluebay" },
    { name: "Acompanhamento de Faturamento", path: "/client-area/bluebay/acompanhamento-faturamento" },
    { name: "Aprovação Financeira", path: "/client-area/bluebay/aprovacao-financeira" },
    { name: "Pedidos por Cliente", path: "/client-area/bluebay/jab-orders-by-client" },
    { name: "Separação de Pedidos", path: "/client-area/bluebay/jab-orders" },
    { name: "Separação por Representante", path: "/client-area/bluebay/jab-orders-by-representante" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-black shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center py-3">
          <NavigationMenu className="bg-black">
            <NavigationMenuList className="gap-1">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <Link to={item.path}>
                    <NavigationMenuLink
                      className={cn(
                        "px-4 py-2 rounded-md text-white hover:bg-gray-800 transition-colors",
                        currentPath === item.path ? "bg-orange-500 hover:bg-orange-600" : ""
                      )}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-between items-center py-3">
          <span className="font-semibold text-lg text-white">Bluebay Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-white hover:bg-gray-800"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden py-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block px-4 py-2 text-sm rounded-md transition-colors text-white",
                  currentPath === item.path
                    ? "bg-orange-500"
                    : "hover:bg-gray-800"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

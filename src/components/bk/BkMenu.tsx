
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const BkMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: "Início", path: "/client-area/bk" },
    { name: "Dashboard", path: "/client-area/bk/dashboard" },
    { name: "Relatórios", path: "/client-area/bk/reports" },
    { name: "Clientes", path: "/client-area/bk/clients" },
    { name: "Financeiro", path: "/client-area/bk/financial" },
    { name: "Solicitações", path: "/client-area/bk/requests" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-purple-900 shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center py-3">
          <NavigationMenu className="bg-purple-900">
            <NavigationMenuList className="gap-1">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <Link to={item.path}>
                    <NavigationMenuLink
                      className={cn(
                        "px-4 py-2 rounded-md text-white hover:bg-purple-800 transition-colors",
                        currentPath === item.path ? "bg-purple-700 hover:bg-purple-700" : ""
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
          <span className="font-semibold text-lg text-white">B&K Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-white hover:bg-purple-800"
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
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
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

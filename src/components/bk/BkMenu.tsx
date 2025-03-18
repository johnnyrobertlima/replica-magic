
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Users, Receipt, BarChart2, FileText, ClipboardCheck } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const BkMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/client-area/bk", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { name: "Clientes", path: "/client-area/bk/clients", icon: <Users className="h-4 w-4 mr-2" /> },
    { name: "Faturamento", path: "/client-area/bk/financial", icon: <Receipt className="h-4 w-4 mr-2" /> },
    { name: "Relatórios", path: "/client-area/bk/reports", icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: "Solicitações", path: "/client-area/bk/requests", icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center py-3">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-2 rounded-md text-white hover:bg-primary-700 transition-colors",
                        isActive ? "bg-primary-800" : ""
                      )
                    }
                    end={item.path === "/client-area/bk"}
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
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
            className="p-1 text-white hover:bg-primary-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
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
          </div>
        )}
      </div>
    </div>
  );
};

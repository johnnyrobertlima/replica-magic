
import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";
import { MenuItem } from "./MenuItem";
import { MenuItemType } from "./types";

interface AdminSubmenuProps {
  items: MenuItemType[];
  isActive: (path: string) => boolean;
  isAnyRouteActive: boolean;
  onItemClick?: () => void;
}

export const AdminSubmenu = ({ items, isActive, isAnyRouteActive, onItemClick }: AdminSubmenuProps) => {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  return (
    <DropdownMenu open={adminMenuOpen} onOpenChange={setAdminMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-white hover:bg-primary-700 transition-colors whitespace-nowrap",
            isAnyRouteActive ? "bg-primary-800 font-medium" : ""
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-primary-800 text-white border-primary-700">
        {items.map((item) => (
          <DropdownMenuItem key={item.path} asChild className="focus:bg-primary-700 focus:text-white hover:bg-primary-700">
            <NavLink
              to={item.path}
              className={({ isActive: routeActive }) =>
                cn(
                  "flex w-full items-center px-2 py-1.5 text-white",
                  (routeActive || isActive(item.path)) ? "bg-primary-900 font-medium" : ""
                )
              }
              onClick={() => {
                setAdminMenuOpen(false);
                if (onItemClick) onItemClick();
              }}
            >
              {item.icon}
              {item.name}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

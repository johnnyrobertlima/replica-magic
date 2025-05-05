
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
            "flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-700 transition-colors whitespace-nowrap",
            isAnyRouteActive ? "bg-blue-800 font-medium" : ""
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-white text-gray-800 border border-gray-200 shadow-md rounded-md p-1 z-50"
      >
        {items.map((item) => (
          <DropdownMenuItem key={item.path} asChild className="focus:bg-gray-100 focus:text-gray-900 hover:bg-gray-100 rounded-sm p-0">
            <NavLink
              to={item.path}
              className={({ isActive: routeActive }) =>
                cn(
                  "flex w-full items-center px-2 py-1.5 text-gray-800",
                  (routeActive || isActive(item.path)) ? "bg-gray-100 font-medium" : ""
                )
              }
              onClick={() => {
                setAdminMenuOpen(false);
                if (onItemClick) onItemClick();
              }}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

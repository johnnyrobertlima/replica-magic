
import { MenuItem } from "./MenuItem";
import { AdminSubmenu } from "./AdminSubmenu";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MenuItemType } from "./types";

interface DesktopMenuProps {
  mainMenuItems: MenuItemType[];
  adminMenuItems: MenuItemType[];
  isActiveRoute: (path: string) => boolean;
  isAnyAdminRouteActive: boolean;
  onLogout: () => void;
}

export const DesktopMenu = ({ 
  mainMenuItems, 
  adminMenuItems, 
  isActiveRoute, 
  isAnyAdminRouteActive,
  onLogout
}: DesktopMenuProps) => {
  return (
    <div className="hidden md:flex justify-between items-center py-3">
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
        {mainMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            path={item.path}
            name={item.name}
            icon={item.icon}
            isActive={isActiveRoute}
            end={item.path === "/client-area/oniagencia"}
          />
        ))}
        
        <AdminSubmenu 
          items={adminMenuItems} 
          isActive={isActiveRoute} 
          isAnyRouteActive={isAnyAdminRouteActive} 
          onItemClick={() => {}}
        />
      </div>
      
      <button
        onClick={onLogout}
        className="flex items-center px-4 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-colors ml-2 shrink-0"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </button>
    </div>
  );
};

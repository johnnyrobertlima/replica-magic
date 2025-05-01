
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenuItem } from "./MobileMenuItem";
import { MobileAdminSubmenu } from "./MobileAdminSubmenu";
import { MenuItemType } from "./types";

interface MobileMenuProps {
  mainMenuItems: MenuItemType[];
  adminMenuItems: MenuItemType[];
  isActiveRoute: (path: string) => boolean;
  onLogout: () => void;
}

export const MobileMenu = ({ 
  mainMenuItems, 
  adminMenuItems, 
  isActiveRoute,
  onLogout
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center py-3">
        <span className="font-semibold text-lg text-white">Oni Agência</span>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
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
            <MobileMenuItem
              key={item.path}
              path={item.path}
              name={item.name}
              icon={item.icon}
              isActive={isActiveRoute}
              onClick={handleClose}
              end={item.path === "/client-area/oniagencia"}
            />
          ))}
          
          {/* Admin submenu */}
          <MobileAdminSubmenu 
            items={adminMenuItems} 
            isActive={isActiveRoute} 
            onItemClick={handleClose}
          />
          
          <button
            onClick={onLogout}
            className="flex w-full items-center px-4 py-3 text-sm rounded-md transition-colors text-white bg-blue-700 hover:bg-blue-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      )}
    </>
  );
};

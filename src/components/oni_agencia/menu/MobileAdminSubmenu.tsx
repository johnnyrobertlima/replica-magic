
import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { MenuItemType } from "./types";
import { MobileMenuItem } from "./MobileMenuItem";

interface MobileAdminSubmenuProps {
  items: MenuItemType[];
  isActive: (path: string) => boolean;
  onItemClick?: () => void;
}

export const MobileAdminSubmenu = ({ items, isActive, onItemClick }: MobileAdminSubmenuProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <button 
        onClick={toggleExpanded}
        className="w-full px-4 pt-2 pb-1 text-sm font-semibold text-gray-300 flex items-center justify-between"
      >
        <div className="flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="space-y-1">
          {items.map((item) => (
            <MobileMenuItem
              key={item.path}
              path={item.path}
              name={item.name}
              icon={item.icon}
              isActive={isActive}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </>
  );
};

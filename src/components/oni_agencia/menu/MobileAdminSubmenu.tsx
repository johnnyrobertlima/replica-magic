
import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { MenuItemType } from "./types";
import { MobileMenuItem } from "./MobileMenuItem";
import { cn } from "@/lib/utils";

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
        className={cn(
          "flex w-full items-center px-4 py-2 text-sm rounded-md transition-colors text-white hover:bg-primary-700",
          expanded ? "bg-primary-800 font-medium" : ""
        )}
      >
        <div className="flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </div>
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="space-y-1 pl-4 bg-white rounded-md my-1 border border-gray-200 shadow-sm">
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

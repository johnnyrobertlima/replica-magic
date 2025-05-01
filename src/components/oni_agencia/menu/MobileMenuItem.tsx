
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileMenuItemProps {
  path: string;
  name: string;
  icon: ReactNode;
  isActive: (path: string) => boolean;
  onClick?: () => void;
  end?: boolean;
}

export const MobileMenuItem = ({ path, name, icon, isActive, onClick, end = false }: MobileMenuItemProps) => {
  return (
    <NavLink
      to={path}
      className={({ isActive: routeActive }) =>
        cn(
          "flex items-center px-4 py-3 text-sm rounded-md transition-colors text-white",
          (routeActive || isActive(path)) ? "bg-primary-900 font-medium" : "hover:bg-primary-700"
        )
      }
      onClick={onClick}
      end={end}
    >
      {icon}
      {name}
    </NavLink>
  );
};

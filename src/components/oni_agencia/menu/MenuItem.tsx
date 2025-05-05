
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  path: string;
  name: string;
  icon: ReactNode;
  isActive: (path: string) => boolean;
  onClick?: () => void;
  end?: boolean;
}

export const MenuItem = ({ path, name, icon, isActive, onClick, end = false }: MenuItemProps) => {
  return (
    <NavLink
      to={path}
      className={({ isActive: routeActive }) =>
        cn(
          "flex items-center px-3 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-600 transition-colors whitespace-nowrap",
          (routeActive || isActive(path)) ? "bg-blue-600" : ""
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

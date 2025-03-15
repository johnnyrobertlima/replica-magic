
import { NavLink } from "react-router-dom";
import { Users, Receipt } from "lucide-react";

export const BkMenu = () => {
  return (
    <div className="flex flex-wrap gap-2 border-b pb-4">
      <NavLink
        to="/client-area/bk"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/client-area/bk/clients"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`
        }
      >
        <Users className="h-4 w-4 mr-2" />
        Clientes
      </NavLink>
      <NavLink
        to="/client-area/bk/financial"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`
        }
      >
        <Receipt className="h-4 w-4 mr-2" />
        Faturamento
      </NavLink>
    </div>
  );
};

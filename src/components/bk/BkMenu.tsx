
import { NavLink } from "react-router-dom";
import { Users, Receipt, BarChart2, FileText, ClipboardCheck } from "lucide-react";

export const BkMenu = () => {
  return (
    <div className="flex flex-wrap gap-2 border-b pb-4 mb-6">
      <NavLink
        to="/client-area/bk"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`
        }
        end
      >
        <BarChart2 className="h-4 w-4 mr-2" />
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
      
      <NavLink
        to="/client-area/bk/reports"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`
        }
      >
        <FileText className="h-4 w-4 mr-2" />
        Relatórios
      </NavLink>
      
      <NavLink
        to="/client-area/bk/requests"
        className={({ isActive }) =>
          `flex items-center px-4 py-2 rounded-md ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`
        }
      >
        <ClipboardCheck className="h-4 w-4 mr-2" />
        Solicitações
      </NavLink>
    </div>
  );
};

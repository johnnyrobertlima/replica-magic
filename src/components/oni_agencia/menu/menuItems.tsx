
import { 
  BarChart2, 
  Smartphone, 
  CalendarDays, 
  CheckSquare, 
  Users, 
  FileSpreadsheet, 
  UserPlus, 
  Briefcase, 
  BookText 
} from "lucide-react";
import { MenuItemType } from "./types";

// Main menu items (non-admin)
export const getMainMenuItems = (): MenuItemType[] => [
  { name: "Home Oni Agência", path: "/client-area/oniagencia", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
  { name: "Visualização em Campo", path: "/client-area/oniagencia/controle-pauta/visualizacaoemcampo", icon: <Smartphone className="h-4 w-4 mr-2" /> },
  { name: "Controle de Pauta", path: "/client-area/oniagencia/controle-pauta", icon: <CalendarDays className="h-4 w-4 mr-2" /> },
  { name: "Relatórios", path: "/client-area/oniagencia/relatorios", icon: <CheckSquare className="h-4 w-4 mr-2" /> },
];

// Admin submenu items
export const getAdminMenuItems = (): MenuItemType[] => [
  { name: "Clientes", path: "/client-area/oniagencia/clientes", icon: <Users className="h-4 w-4 mr-2" /> },
  { name: "Serviços", path: "/client-area/oniagencia/servicos", icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> },
  { name: "Colaboradores", path: "/client-area/oniagencia/colaboradores", icon: <UserPlus className="h-4 w-4 mr-2" /> },
  { name: "Escopo por Cliente", path: "/client-area/oniagencia/escopos", icon: <Briefcase className="h-4 w-4 mr-2" /> },
  { name: "Gerenciar Conteúdo", path: "/admin/sub-themes", icon: <BookText className="h-4 w-4 mr-2" /> },
];

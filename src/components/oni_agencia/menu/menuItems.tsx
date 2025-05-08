
import {
  BarChartIcon,
  CalendarIcon,
  ClipboardListIcon,
  UsersIcon,
  TruckIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  GalleryThumbnailsIcon,
  CameraIcon
} from "lucide-react";

export const menuItems = [
  {
    title: "Home",
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia",
  },
  {
    title: "Controle de Pauta",
    icon: <CalendarIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/controle-pauta",
  },
  {
    title: "Agenda de Capturas",
    icon: <CameraIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/capturas",
  },
  {
    title: "Clientes",
    icon: <UsersIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/clientes",
  },
  {
    title: "Serviços",
    icon: <ClipboardListIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/servicos",
  },
  {
    title: "Colaboradores",
    icon: <TruckIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/colaboradores",
  },
  {
    title: "Relatórios",
    icon: <BarChartIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/relatorios",
  },
  {
    title: "Escopos",
    icon: <GalleryThumbnailsIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/escopos",
  },
  {
    title: "Carga de Colaboradores",
    icon: <SettingsIcon className="w-5 h-5" />,
    href: "/client-area/oniagencia/cargacolab",
  },
];

export const adminSubmenuItems = [
  {
    title: "Administradores",
    href: "/admin/users",
  },
  {
    title: "Permissões",
    href: "/admin/permissions",
  },
];

import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image,
  Wrench,
  Users,
  Share2,
  LogOut,
  Mail,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Banners",
    href: "/admin/banners",
    icon: Image,
  },
  {
    name: "Serviços",
    href: "/admin/services",
    icon: Wrench,
  },
  {
    name: "Clientes",
    href: "/admin/clients",
    icon: Users,
  },
  {
    name: "Redes Sociais",
    href: "/admin/social",
    icon: Share2,
  },
  {
    name: "Mensagens",
    href: "/admin/messages",
    icon: Mail,
  },
];

export const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-center border-b">
            <h1 className="text-xl font-bold">ONI Admin</h1>
          </div>
          <nav className="mt-6 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100",
                    location.pathname === item.href && "bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                // TODO: Implement logout
              }}
              className="mt-6 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
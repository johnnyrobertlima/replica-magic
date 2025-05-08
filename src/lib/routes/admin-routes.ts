
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ServiceManagement from "@/pages/admin/ServiceManagement";
import ClientManagement from "@/pages/admin/ClientManagement";
import UserManagement from "@/pages/admin/UserManagement";
import AdminSEO from "@/pages/admin/AdminSEO";
import SettingsPage from "@/pages/admin/settings";
import { AdminPermissions } from "@/pages/admin/permissions"; // Import as a named export

export const adminRoutes = [
  {
    path: "/admin",
    element: AdminDashboard,
  },
  {
    path: "/admin/services",
    element: ServiceManagement,
  },
  {
    path: "/admin/clients",
    element: ClientManagement,
  },
  {
    path: "/admin/users",
    element: UserManagement,
  },
  {
    path: "/admin/seo",
    element: AdminSEO,
  },
  {
    path: "/admin/settings",
    element: SettingsPage,
  },
  {
    path: "/admin/permissions",
    element: AdminPermissions, // Use the named export
  },
] as const;

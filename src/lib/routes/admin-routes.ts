
import UserGroupManagement from "@/pages/admin/users/UserGroupManagement";
import { AdminBanners } from "@/pages/admin/banners";
import AdminRequests from "@/pages/admin/requests";
import AdminSubThemes from "@/pages/admin/sub-themes";
import { AdminPermissions } from "@/pages/admin/permissions";
import AdminIconsPage from "@/pages/admin/icons";

export const adminRoutes = [
  {
    path: "/admin/users",
    element: UserGroupManagement,
  },
  {
    path: "/admin/banners",
    element: AdminBanners,
  },
  {
    path: "/admin/requests",
    element: AdminRequests,
  },
  {
    path: "/admin/sub-themes",
    element: AdminSubThemes,
  },
  {
    path: "/admin/permissions",
    element: AdminPermissions,
  },
  {
    path: "/admin/icons",
    element: AdminIconsPage,
  },
] as const;

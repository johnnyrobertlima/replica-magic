
import UserGroupManagement from "@/pages/admin/users/UserGroupManagement";
import { AdminBanners } from "@/pages/admin/banners";
import AdminRequests from "@/pages/admin/requests";

export const adminRoutes = [
  {
    path: "/admin/users",
    element: <UserGroupManagement />,
  },
  {
    path: "/admin/banners",
    element: <AdminBanners />,
  },
  {
    path: "/admin/requests",
    element: <AdminRequests />,
  },
] as const;

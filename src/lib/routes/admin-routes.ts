
// Create temporary component placeholders to satisfy imports
const PlaceholderComponent = () => <div>Coming Soon</div>;

// Use placeholders for all admin routes
const AdminDashboard = PlaceholderComponent;
const ServiceManagement = PlaceholderComponent;
const ClientManagement = PlaceholderComponent;
const UserManagement = PlaceholderComponent;
const AdminSEO = PlaceholderComponent;
const SettingsPage = PlaceholderComponent;
const AdminPermissions = PlaceholderComponent;

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
    element: AdminPermissions,
  },
] as const;

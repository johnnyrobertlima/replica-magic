
import { Routes } from "react-router-dom";
import { PublicRoutes } from "./public-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { AdminRoutes } from "./admin-routes";
import { AuthRoutes } from "./auth-routes";

export function AppRoutes() {
  return (
    <Routes>
      {/* Import authentication routes */}
      <AuthRoutes />
      
      {/* Import routes from other modular route files */}
      <PublicRoutes />
      <ClientAreaRoutes />
      <AdminRoutes />
    </Routes>
  );
}


import { Routes, Route } from "react-router-dom";
import { AdminRoutes } from "./admin-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { PublicRoutes } from "./public-routes";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <PublicRoutes />
      
      {/* Client Area Routes */}
      <ClientAreaRoutes />
      
      {/* Admin Routes */}
      <AdminRoutes />
    </Routes>
  );
}

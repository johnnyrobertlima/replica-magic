
import { Routes } from "react-router-dom";
import { AdminRoutes } from "./admin-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { PublicRoutes } from "./public-routes";

export function AppRoutes() {
  return (
    <Routes>
      <PublicRoutes />
      <ClientAreaRoutes />
      <AdminRoutes />
    </Routes>
  );
}

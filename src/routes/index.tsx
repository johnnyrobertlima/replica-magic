
import { Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./public-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { AdminRoutes } from "./admin-routes";

export function AppRoutes() {
  return (
    <Routes>
      <Route>
        <PublicRoutes />
      </Route>
      <Route>
        <ClientAreaRoutes />
      </Route>
      <Route>
        <AdminRoutes />
      </Route>
    </Routes>
  );
}

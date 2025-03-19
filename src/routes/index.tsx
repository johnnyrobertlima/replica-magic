
import { Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./public-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { AdminRoutes } from "./admin-routes";

export function AppRoutes() {
  return (
    <Routes>
      <Route>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/client-area/*" element={<ClientAreaRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
    </Routes>
  );
}

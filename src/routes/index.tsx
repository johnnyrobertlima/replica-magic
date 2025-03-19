
import { Routes, Route } from "react-router-dom";
import { adminRoutes } from "./admin-routes";
import { clientAreaRoutes } from "./client-area-routes";
import { publicRoutes } from "./public-routes";

export function AppRoutes() {
  return (
    <Routes>
      {publicRoutes}
      {clientAreaRoutes}
      {adminRoutes}
    </Routes>
  );
}

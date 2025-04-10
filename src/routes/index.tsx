
import { Routes, Route } from "react-router-dom";
import { adminRoutes } from "./admin-routes";
import { clientAreaRoutes } from "./client-area-routes";
import { publicRoutes } from "./public-routes";
import { bluebayRoutes } from "./bluebay-routes";
import { bkRoutes } from "./bk-routes";
import { bluebayAdmRoutes } from "./bluebay-adm-routes";
import { oniAgenciaRoutes } from "./oni-agencia-routes";

export function AppRoutes() {
  return (
    <Routes>
      {publicRoutes}
      {clientAreaRoutes}
      {adminRoutes}
      {bluebayRoutes}
      {bkRoutes}
      {bluebayAdmRoutes}
      {oniAgenciaRoutes}
    </Routes>
  );
}

export const routes = [
  publicRoutes,
  clientAreaRoutes,
  adminRoutes,
  bluebayRoutes,
  bkRoutes,
  bluebayAdmRoutes,
  oniAgenciaRoutes
];

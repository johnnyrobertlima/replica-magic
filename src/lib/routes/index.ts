
import { adminRoutes } from "./admin-routes";
import { clientAreaRoutes } from "./client-area-routes"; 
import { bluebayRoutes } from "./bluebay-routes";
import { bkRoutes } from "./bk-routes";
import { bluebayAdmRoutes } from "./bluebay-adm-routes";
import { oniAgenciaRoutes } from "./oni-agencia-routes";
import { publicRoutes } from "./public-routes";

export const routes = [
  ...publicRoutes,
  ...clientAreaRoutes,
  ...bluebayRoutes,
  ...bkRoutes,
  ...bluebayAdmRoutes,
  ...oniAgenciaRoutes,
  ...adminRoutes
];

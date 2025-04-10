
import React from "react";
import { Route } from "react-router-dom";
import { publicRoutes } from "./routes/public-routes";
import { adminRoutes } from "./routes/admin-routes";
import { clientAreaRoutes } from "./routes/client-area-routes";
import { bluebayRoutes } from "./routes/bluebay-routes";
import { bkRoutes } from "./routes/bk-routes";
import { bluebayAdmRoutes } from "./routes/bluebay-adm-routes";
import { oniAgenciaRoutes } from "./routes/oni-agencia-routes";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

// Convert route configuration objects to actual Route components
const createRouteElements = (routeConfigs) => {
  return routeConfigs.map((route) => {
    // For public routes, no permission guard is needed
    if (route.path.startsWith("/admin")) {
      return (
        <Route 
          key={route.path} 
          path={route.path} 
          element={
            <PermissionGuard 
              resourcePath={route.path}
              requiredPermission={route.path === "/admin/users" ? "admin" : undefined}
            >
              <route.element />
            </PermissionGuard>
          } 
        />
      );
    } else if (route.path.startsWith("/client-area") || route.path === "/post-management") {
      return (
        <Route 
          key={route.path} 
          path={route.path} 
          element={
            <PermissionGuard resourcePath={route.path}>
              <route.element />
            </PermissionGuard>
          } 
        />
      );
    } else {
      // Public routes
      return <Route key={route.path} path={route.path} element={<route.element />} />;
    }
  });
};

// Generate all routes
export const publicRouteElements = createRouteElements(publicRoutes);
export const adminRouteElements = createRouteElements(adminRoutes);
export const clientAreaRouteElements = createRouteElements(clientAreaRoutes);
export const bluebayRouteElements = createRouteElements(bluebayRoutes);
export const bkRouteElements = createRouteElements(bkRoutes);
export const bluebayAdmRouteElements = createRouteElements(bluebayAdmRoutes);
export const oniAgenciaRouteElements = createRouteElements(oniAgenciaRoutes);

// Combine all routes for export
export const routes = [
  ...publicRouteElements,
  ...adminRouteElements,
  ...clientAreaRouteElements,
  ...bluebayRouteElements,
  ...bkRouteElements,
  ...bluebayAdmRouteElements,
  ...oniAgenciaRouteElements
];

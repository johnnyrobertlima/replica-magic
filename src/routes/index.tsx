
import { Route, Routes } from "react-router-dom";
import { Fragment } from "react";
import { PublicRoutes } from "./public-routes";
import { ClientAreaRoutes } from "./client-area-routes"; 
import { AdminRoutes } from "./admin-routes";

export function AppRoutes() {
  return (
    <Routes>
      <Fragment>
        <PublicRoutes />
        <ClientAreaRoutes />
        <AdminRoutes />
      </Fragment>
    </Routes>
  );
}

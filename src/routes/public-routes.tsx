
import { Route } from "react-router-dom";
import { Fragment } from "react";
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";

export function PublicRoutes() {
  return (
    <Fragment>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<ClientLogin />} />
    </Fragment>
  );
}

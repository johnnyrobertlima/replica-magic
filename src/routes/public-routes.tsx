
import { Route, Fragment } from "react-router-dom";
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

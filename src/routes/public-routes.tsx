
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";

export function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<ClientLogin />} />
    </>
  );
}

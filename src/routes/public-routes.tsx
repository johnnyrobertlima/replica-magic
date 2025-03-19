
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import ResetPassword from "@/pages/ResetPassword";

export function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<ClientLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Rota para capturar hash redirects */}
      <Route path="/#" element={<ResetPassword />} />
    </>
  );
}

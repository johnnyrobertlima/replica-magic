
import { Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./public-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { AdminRoutes } from "./admin-routes";
import SignupConfirmation from "@/pages/SignupConfirmation";
import ResetPassword from "@/pages/ResetPassword";
import ClientLogin from "@/pages/ClientLogin";

export function AppRoutes() {
  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/" element={<SignupConfirmation />} />
      <Route path="/login" element={<ClientLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Import routes from other modular route files */}
      <PublicRoutes />
      <ClientAreaRoutes />
      <AdminRoutes />
    </Routes>
  );
}

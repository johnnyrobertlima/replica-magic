
import { Routes } from "react-router-dom";
import { PublicRoutes } from "./public-routes";
import { ClientAreaRoutes } from "./client-area-routes";
import { AdminRoutes } from "./admin-routes";
import ResetPassword from "@/pages/ResetPassword";
import SignupConfirmation from "@/pages/SignupConfirmation";
import { Route } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      {/* Root Route - Email Signup Confirmation */}
      <Route path="/" element={<SignupConfirmation />} />
      
      {/* Reset Password Route */}
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Import routes from modular route files */}
      <PublicRoutes />
      <ClientAreaRoutes />
      <AdminRoutes />
    </Routes>
  );
}

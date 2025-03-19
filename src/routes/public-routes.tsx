
import { Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import ResetPassword from "@/pages/ResetPassword";
import SignupConfirmation from "@/pages/SignupConfirmation";

export function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Index />} index />
      <Route path="/login" element={<ClientLogin />} />
      <Route path="/#" element={<ResetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup-confirmation" element={<SignupConfirmation />} />
      <Route path="*" element={<Navigate to="/" />} />
    </>
  );
}

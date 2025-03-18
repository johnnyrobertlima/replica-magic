
import { Fragment } from "react";
import { Route } from "react-router-dom";
import SignupConfirmation from "@/pages/SignupConfirmation";
import ResetPassword from "@/pages/ResetPassword";
import ClientLogin from "@/pages/ClientLogin";

export function AuthRoutes() {
  return (
    <Fragment>
      {/* Root Route - Email Signup Confirmation */}
      <Route path="/" element={<SignupConfirmation />} />
      
      {/* Login Route */}
      <Route path="/login" element={<ClientLogin />} />
      
      {/* Reset Password Route */}
      <Route path="/reset-password" element={<ResetPassword />} />
    </Fragment>
  );
}


import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import ResetPassword from "@/pages/ResetPassword";
import SignupConfirmation from "@/pages/SignupConfirmation";

export const publicRoutes = [
  {
    path: "/",
    element: Index,
  },
  {
    path: "/login",
    element: ClientLogin,
  },
  {
    path: "/reset-password",
    element: ResetPassword,
  },
  {
    path: "/signup-confirmation",
    element: SignupConfirmation,
  },
] as const;

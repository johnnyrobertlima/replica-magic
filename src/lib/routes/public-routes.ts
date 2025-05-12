
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import ResetPassword from "@/pages/ResetPassword";
import SignupConfirmation from "@/pages/SignupConfirmation";
import NovoClienteFeirinha from "@/pages/NovoClienteFeirinha";

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
  {
    path: "/novocliente/feirinha",
    element: NovoClienteFeirinha,
  },
] as const;

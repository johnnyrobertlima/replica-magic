
import Index from "@/pages/Index";
import ClientLogin from "@/pages/ClientLogin";
import ResetPassword from "@/pages/ResetPassword";

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
] as const;

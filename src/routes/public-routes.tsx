
import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import SignupConfirmation from "@/pages/SignupConfirmation";

// Importações lazy para melhorar o carregamento da aplicação
const ClientLogin = lazy(() => import("@/pages/ClientLogin"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Index = lazy(() => import("@/pages/Index"));

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
    index: true,
  },
  {
    path: "/login",
    element: <ClientLogin />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/signup-confirmation",
    element: <SignupConfirmation />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  }
];

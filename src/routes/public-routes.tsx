
import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import SignupConfirmation from "@/pages/SignupConfirmation";

// Importações lazy para melhorar o carregamento da aplicação
const ClientLogin = lazy(() => import("@/pages/ClientLogin"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Index = lazy(() => import("@/pages/Index"));
const NovoClienteFeirinha = lazy(() => import("@/pages/NovoClienteFeirinha"));

export const publicRoutes = (
  <>
    {/* Public Routes */}
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<ClientLogin />} />
    {/* Adicionamos uma rota com path="/#" para capturar hash redirects */}
    <Route path="/#" element={<ResetPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/signup-confirmation" element={<SignupConfirmation />} />
    <Route path="/novocliente/feirinha" element={<NovoClienteFeirinha />} />
    <Route path="*" element={<Navigate to="/" />} />
  </>
);


import { Routes, Route } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import BluebayHome from "@/pages/BluebayHome";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import JabOrdersByRepresentante from "@/pages/JabOrdersByRepresentante";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";
import AcompanhamentoFaturamento from "@/pages/AcompanhamentoFaturamento";

export function BluebayRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <BluebayHome />
        </PermissionGuard>
      } />
      
      <Route path="/jab-orders" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <JabOrders />
        </PermissionGuard>
      } />
      
      <Route path="/jab-orders-by-client" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <JabOrdersByClient />
        </PermissionGuard>
      } />
      
      <Route path="/jab-orders-by-representante" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <JabOrdersByRepresentante />
        </PermissionGuard>
      } />
      
      <Route path="/aprovacao-financeira" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <AprovacaoFinanceira />
        </PermissionGuard>
      } />
      
      <Route path="/acompanhamento-faturamento" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <AcompanhamentoFaturamento />
        </PermissionGuard>
      } />
    </Routes>
  );
}


import { Route } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import BluebayHome from "@/pages/BluebayHome";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import JabOrdersByRepresentante from "@/pages/JabOrdersByRepresentante";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";
import AcompanhamentoFaturamento from "@/pages/AcompanhamentoFaturamento";

export function BluebayRoutes() {
  return (
    <>
      <Route path="/client-area/bluebay" element={
        <PermissionGuard resourcePath="/client-area/bluebay">
          <BluebayHome />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/jab-orders" element={
        <PermissionGuard resourcePath="/client-area/bluebay/jab-orders">
          <JabOrders />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/jab-orders-by-client" element={
        <PermissionGuard resourcePath="/client-area/bluebay/jab-orders-by-client">
          <JabOrdersByClient />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/jab-orders-by-representante" element={
        <PermissionGuard resourcePath="/client-area/bluebay/jab-orders-by-client">
          <JabOrdersByRepresentante />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/aprovacao-financeira" element={
        <PermissionGuard resourcePath="/client-area/bluebay/aprovacao-financeira">
          <AprovacaoFinanceira />
        </PermissionGuard>
      } />
      <Route path="/client-area/bluebay/acompanhamento-faturamento" element={
        <PermissionGuard resourcePath="/client-area/bluebay/aprovacao-financeira">
          <AcompanhamentoFaturamento />
        </PermissionGuard>
      } />
    </>
  );
}

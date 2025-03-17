
import { Route } from "react-router-dom";
import { Fragment } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import BluebayHome from "@/pages/BluebayHome";
import JabOrders from "@/pages/JabOrders";
import JabOrdersByClient from "@/pages/JabOrdersByClient";
import JabOrdersByRepresentante from "@/pages/JabOrdersByRepresentante";
import AprovacaoFinanceira from "@/pages/AprovacaoFinanceira";
import AcompanhamentoFaturamento from "@/pages/AcompanhamentoFaturamento";

export function BluebayRoutes() {
  return (
    <Fragment>
      <Route path="/client-area/jab" element={
        <PermissionGuard resourcePath="/client-area/jab">
          <BluebayHome />
        </PermissionGuard>
      } />
      <Route path="/client-area/jab/jab-orders" element={
        <PermissionGuard resourcePath="/client-area/jab/jab-orders">
          <JabOrders />
        </PermissionGuard>
      } />
      <Route path="/client-area/jab/jab-orders-by-client" element={
        <PermissionGuard resourcePath="/client-area/jab/jab-orders-by-client">
          <JabOrdersByClient />
        </PermissionGuard>
      } />
      <Route path="/client-area/jab/jab-orders-by-representante" element={
        <PermissionGuard resourcePath="/client-area/jab/jab-orders-by-client">
          <JabOrdersByRepresentante />
        </PermissionGuard>
      } />
      <Route path="/client-area/jab/aprovacao-financeira" element={
        <PermissionGuard resourcePath="/client-area/jab/aprovacao-financeira">
          <AprovacaoFinanceira />
        </PermissionGuard>
      } />
      <Route path="/client-area/jab/acompanhamento-faturamento" element={
        <PermissionGuard resourcePath="/client-area/jab/aprovacao-financeira">
          <AcompanhamentoFaturamento />
        </PermissionGuard>
      } />
    </Fragment>
  );
}

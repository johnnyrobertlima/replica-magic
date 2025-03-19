
import { Route } from "react-router-dom";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import BkHome from "@/pages/BkHome";
import BkClients from "@/pages/bk/BkClients";
import BkFinancial from "@/pages/bk/BkFinancial";
import BkReports from "@/pages/bk/BkReports";
import BkDashboard from "@/pages/bk/BkDashboard";
import BkGestaoTitulos from "@/pages/bk/BkGestaoTitulos";
import BkFinanceiroManager from "@/pages/bk/BkFinanceiroManager";
import BkClientFinancialSummary from "@/pages/bk/BkClientFinancialSummary";

export const bkRoutes = (
  <>
    <Route path="/client-area/bk" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <BkHome />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/clients" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <BkClients />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/financial" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <BkFinancial />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/gestaotitulos" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <BkGestaoTitulos />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/financeiromanager" element={
      <PermissionGuard resourcePath="/client-area/bk/financeiromanager">
        <BkFinanceiroManager />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/clientefinancial" element={
      <PermissionGuard resourcePath="/client-area/bk/financeiromanager">
        <BkClientFinancialSummary />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/reports" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <BkReports />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/dashboard" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <BkDashboard />
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/invoice-control" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">Controle de Faturamento</h1>
          <p className="text-muted-foreground">Esta funcionalidade estará disponível em breve.</p>
        </div>
      </PermissionGuard>
    } />
    <Route path="/client-area/bk/requests" element={
      <PermissionGuard resourcePath="/client-area/bk">
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4">Solicitações</h1>
          <p className="text-muted-foreground">Esta funcionalidade estará disponível em breve.</p>
        </div>
      </PermissionGuard>
    } />
  </>
);
